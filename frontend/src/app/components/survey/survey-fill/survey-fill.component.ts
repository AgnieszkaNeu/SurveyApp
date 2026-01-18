import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { Survey, AnswerType } from '../../../models/survey.model';
import { ConsentService } from '../../../services/consent.service';
import { FingerprintService } from '../../../services/fingerprint.service';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-survey-fill',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './survey-fill.component.html',
  styleUrls: ['./survey-fill.component.scss']
})


export class SurveyFillComponent implements OnInit {
  survey: Survey | null = null;
  responseForm: FormGroup;
  loading = true;
  submitting = false;
  successMessage = '';
  errorMessage = '';
  alreadySubmittedMessage = '';
  AnswerType = AnswerType;
  milestone50Shown = false;
  milestone100Shown = false;
  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private route: ActivatedRoute,
    private router: Router,
    private consentService: ConsentService,
    private fingerprintService: FingerprintService,
    private authService: AuthService
  ) {
    this.responseForm = this.fb.group({
      answers: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const url = this.route.snapshot.url;

    if (url[0]?.path === 'survey' && url[1]?.path === 'fill') {
      const token = this.route.snapshot.params['token'];
      this.loadSurveyByToken(token);
    } else if (url[0]?.path === 'survey' && url[2]?.path === 'fill-public') {
      const surveyId = this.route.snapshot.params['id'];
      this.loadPublicSurvey(surveyId);
    } else {
      const surveyId = this.route.snapshot.params['id'];
      this.loadSurvey(surveyId);
    }
  }

  get answers(): FormArray {
    return this.responseForm.get('answers') as FormArray;
  }

  loadSurvey(surveyId: string): void {
    this.surveyService.getSurveyById(surveyId).subscribe({
      next: (survey) => {

        if (survey.status === 'expired') {
          this.errorMessage = 'Ta ankieta wygasła i nie można już jej wypełnić.';
          this.loading = false;
          return;
        }
        if (this.checkAlreadySubmitted(survey.id)) {
          return;
        }
        this.checkBackendFingerprint(survey);
      },
      error: (error) => {
        this.handleLoadError(error);
      }
    });
  }

  loadSurveyByToken(token: string): void {
    this.surveyService.getSurveyByToken(token).subscribe({
      next: (survey) => {

        if (survey.status === 'expired') {
          this.errorMessage = 'Ta ankieta wygasła i nie można już jej wypełnić.';
          this.loading = false;
          return;
        }
        if (this.checkAlreadySubmitted(survey.id)) {
          return;
        }
        this.checkBackendFingerprint(survey);
      },
      error: (error) => {
        this.handleLoadError(error);
      }
    });
  }

  loadPublicSurvey(surveyId: string): void {
    this.surveyService.getPublicSurveyById(surveyId).subscribe({
      next: (survey) => {

        if (survey.status === 'expired') {
          this.errorMessage = 'Ta ankieta wygasła i nie można już jej wypełnić.';
          this.loading = false;
          return;
        }
        if (this.checkAlreadySubmitted(survey.id)) {
          return;
        }
        this.checkBackendFingerprint(survey);
      },
      error: (error) => {
        this.handleLoadError(error);
      }
    });
  }
  private async checkBackendFingerprint(survey: Survey): Promise<void> {
    let fingerprintAdvanced: string | null = null;
    if (this.consentService.canUseFingerprinting()) {
      try {
        fingerprintAdvanced = await this.fingerprintService.getFingerprint();
      } catch (error) {
      }
    }
    this.surveyService.checkAlreadySubmitted(survey.id, fingerprintAdvanced || undefined).subscribe({
      next: (response) => {

        if (response.already_submitted) {
          this.markAsSubmitted(survey.id);
          this.alreadySubmittedMessage = 'success';
          this.loading = false;
        } else {
          this.survey = survey;
          this.setupForm();
          this.loading = false;
        }
      },
      error: () => {
        this.survey = survey;
        this.setupForm();
        this.loading = false;
      }
    });
  }

  private handleLoadError(error: any): void {
    this.loading = false;

    if (error.status === 404) {
      this.errorMessage = 'Ankieta nie została znaleziona lub link wygasł.';
    } else if (error.status === 403) {
      this.errorMessage = 'Nie masz dostępu do tej ankiety.';
    } else if (error.status === 410) {
      this.errorMessage = 'Link do ankiety wygasł.';
    } else {
      this.errorMessage = 'Nie udało się załadować ankiety. Spróbuj ponownie później.';
    }
  }

  setupForm(): void {
    if (!this.survey) return;
    this.survey.questions.forEach(question => {
      const isOpenQuestion = question.answer_type === AnswerType.OPEN;
      const validators = isOpenQuestion ? [Validators.required, this.notOnlyWhitespaceValidator()] : [];

      if (question.answer_type === AnswerType.MULTIPLE) {
        const checkboxes = this.fb.array(
          question.choices.map(() => this.fb.control(false))
        );
        this.answers.push(this.fb.group({
          question_id: [question.id],
          checkboxes: checkboxes
        }));
      } else if (question.answer_type === AnswerType.EMAIL) {
        this.answers.push(this.fb.group({
          question_id: [question.id],
          response: ['', [...validators, Validators.email]]
        }));
      } else if (question.answer_type === AnswerType.NUMBER || question.answer_type === AnswerType.SCALE) {
        const defaultValue = question.settings?.min || 1;
        this.answers.push(this.fb.group({
          question_id: [question.id],
          response: [defaultValue, validators]
        }));
      } else if (question.answer_type === AnswerType.YES_NO) {
        this.answers.push(this.fb.group({
          question_id: [question.id],
          response: ['', validators]
        }));
      } else {
        this.answers.push(this.fb.group({
          question_id: [question.id],
          response: ['', validators]
        }));
      }
    });
  }

  private notOnlyWhitespaceValidator() {
    return (control: any) => {
      const value = control.value;

      if (!value || typeof value !== 'string') {
        return null;
      }
      const isOnlyWhitespace = value.trim().length === 0;
      return isOnlyWhitespace ? { whitespace: true } : null;
    };
  }

  getStarArray(max: number = 5): number[] {
    return Array.from({length: max}, (_, i) => i + 1);
  }

  async onSubmit(): Promise<void> {

    if (this.responseForm.invalid) {
      const firstInvalid = document.querySelector('.is-invalid, .ng-invalid.ng-touched');

      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalid as HTMLElement).focus();
      }
      this.answers.controls.forEach(control => {
        control.markAllAsTouched();
      });
      return;
    }

    if (this.responseForm.valid && this.survey) {
      this.submitting = true;
      this.errorMessage = '';
      const advancedFingerprint = await this.fingerprintService.getFingerprint();
      const submission = {
        survey_id: this.survey.id,
        fingerprint_advanced: advancedFingerprint,
        answers: this.answers.controls.map((control, index) => {
          const question = this.survey!.questions[index];

          if (question.answer_type === AnswerType.MULTIPLE) {
            const checkboxes = control.get('checkboxes')?.value;
            const selectedChoices = question.choices
              .filter((_, i) => checkboxes[i])
              .map(c => c.content);
            return {
              question_id: control.get('question_id')?.value,
              response: selectedChoices.join(', ')
            };
          } else {
            const response = control.get('response')?.value;
            return {
              question_id: control.get('question_id')?.value,
              response: response !== null && response !== undefined ? String(response) : ''
            };
          }
        })
      };
      this.surveyService.submitSurvey(submission).subscribe({
        next: () => {
          this.markAsSubmitted(this.survey!.id);
          this.successMessage = 'Dziękujemy za wypełnienie ankiety!';
          this.submitting = false;
          setTimeout(() => this.router.navigate(['/']), 2000);
        },
        error: (error) => {

          if (error.status === 429) {
            this.errorMessage = error.error?.detail || 'Zbyt wiele przesłanych ankiet. Spróbuj ponownie za chwilę.';
            this.submitting = false;
          } else if (error.status === 409 || error.status === 400) {
            const errorMessage = error.error?.message || error.error?.detail || '';
            if (errorMessage.includes('zmodyfikowana') || errorMessage.includes('Niektóre pytania') || errorMessage.includes('Opcje odpowiedzi')) {
              this.errorMessage = errorMessage;
              this.submitting = false;
            } else if (errorMessage.includes('Już wypełniłeś')) {
              this.markAsSubmitted(this.survey!.id);
              this.alreadySubmittedMessage = 'success';
              this.survey = null;
              this.errorMessage = '';
            } else {
              this.errorMessage = errorMessage || 'Błąd podczas wysyłania ankiety';
            }
          } else if (error.status === 410) {
            this.errorMessage = error.error?.detail || 'Ta ankieta wygasła i nie można już jej wypełnić.';
          } else {
            this.errorMessage = error.error?.message || error.error?.detail || 'Błąd podczas wysyłania ankiety';
          }
          this.submitting = false;
        }
      });
    }
  }

  getCheckboxes(answerIndex: number): FormArray {
    return this.answers.at(answerIndex).get('checkboxes') as FormArray;
  }

  getProgress(): number {

    if (!this.survey || this.survey.questions.length === 0) {
      return 0;
    }
    const answeredCount = this.getAnsweredCount();
    const progress = Math.round((answeredCount / this.survey.questions.length) * 100);

    if (progress >= 50 && progress < 55 && !this.milestone50Shown) {
      this.showMilestone('Połowa za Tobą!');
      this.milestone50Shown = true;
    }

    if (progress === 100 && !this.milestone100Shown) {
      this.showMilestone('Świetna robota! Możesz wysłać ankietę');
      this.milestone100Shown = true;
    }
    return progress;
  }

  private showMilestone(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {

      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  getAnsweredCount(): number {
    let count = 0;
    this.answers.controls.forEach((control, index) => {
      if (!this.survey) return;
      const question = this.survey.questions[index];

      if (question.answer_type === AnswerType.MULTIPLE) {
        const checkboxes = control.get('checkboxes')?.value;
        if (checkboxes && checkboxes.some((checked: boolean) => checked)) {
          count++;
        }
      } else {
        const response = control.get('response')?.value;

        if (response !== null && response !== undefined && response !== '') {
          if (typeof response === 'string' && response.trim() === '') {
            return;
          }
          count++;
        }
      }
    });
    return count;
  }

  getQuestionTypeLabel(answerType: AnswerType): string {

    switch (answerType) {
      case AnswerType.OPEN:
        return 'Pytanie otwarte';
      case AnswerType.CLOSE:
        return 'Wybierz jedną odpowiedź';
      case AnswerType.MULTIPLE:
        return 'Wybierz wszystkie pasujące';
      default:
        return '';
    }
  }

  private checkAlreadySubmitted(surveyId: string): boolean {
    try {
      const storageKey = this.getStorageKey();
      const submitted = localStorage.getItem(storageKey);

      if (submitted) {
        const submittedSurveys = JSON.parse(submitted);
        if (submittedSurveys.includes(surveyId)) {
          this.alreadySubmittedMessage = 'success';
          this.loading = false;
          return true;
        }
      }
    } catch (error) {
    }
    return false;
  }

  private markAsSubmitted(surveyId: string): void {
    try {
      const storageKey = this.getStorageKey();
      let submitted = localStorage.getItem(storageKey);
      let submittedSurveys: string[] = submitted ? JSON.parse(submitted) : [];
      if (!submittedSurveys.includes(surveyId)) {
        submittedSurveys.push(surveyId);
        localStorage.setItem(storageKey, JSON.stringify(submittedSurveys));
      }
    } catch (error) {
    }
  }

  private getStorageKey(): string {
    const token = this.authService.getToken();

    if (!token) {
      return 'submittedSurveys_guest';
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub || payload.user_id || payload.id || 'unknown';
      return `submittedSurveys_${userId}`;
    } catch (error) {
      return 'submittedSurveys_guest';
    }
  }

  refreshPage(): void {
    window.location.reload();
  }

  getEstimatedTime(): number {
    if (!this.survey) return 0;
    const openQuestions = this.survey.questions.filter(
      q => q.answer_type === AnswerType.OPEN
    ).length;
    const closedQuestions = this.survey.questions.length - openQuestions;
    const estimatedMinutes = Math.ceil((openQuestions * 0.5 + closedQuestions * 0.17));
    return estimatedMinutes || 1;
  }

  isQuestionRequired(index: number): boolean {
    return true;
  }

  isQuestionAnswered(index: number): boolean {
    if (!this.survey) return false;
    const control = this.answers.at(index);
    const question = this.survey.questions[index];

    if (question.answer_type === AnswerType.MULTIPLE) {
      const checkboxes = control.get('checkboxes')?.value;
      return checkboxes && checkboxes.some((checked: boolean) => checked);
    } else if (question.answer_type === AnswerType.SCALE || question.answer_type === AnswerType.NUMBER) {
      const value = control.get('response')?.value;
      return value !== null && value !== undefined;
    } else {
      const value = control.get('response')?.value;
      return value !== null && value !== undefined && value !== '';
    }
  }
}
