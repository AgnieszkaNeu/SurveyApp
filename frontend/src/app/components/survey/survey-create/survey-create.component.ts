import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { TemplateService } from '../../../services/template.service';
import { AnswerType, SurveyTemplate, TemplateCategory, SurveyStatus } from '../../../models/survey.model';
import { CanComponentDeactivate } from '../../../guards/pending-changes.guard';
import { Observable, Subject } from 'rxjs';
@Component({
  selector: 'app-survey-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './survey-create.component.html',
  styleUrls: ['./survey-create.component.scss']
})


export class SurveyCreateComponent implements OnInit, CanComponentDeactivate {
  surveyForm: FormGroup;
  questionsForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  templateErrorMessage = '';
  currentStep = 0;
  creationMethod: 'blank' | 'template' | 'duplicate' | null = null;
  createdSurveyId: string | null = null;
  answerTypes = Object.values(AnswerType);
  surveyStatuses = Object.values(SurveyStatus);
  loadedTemplate: SurveyTemplate | null = null;
  showSaveAsTemplateModal = false;
  showCancelConfirmModal = false;
  showNavigationConfirmModal = false;
  navigationConfirmSubject: Subject<boolean> | null = null;
  navigationApproved = false;
  templateForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private templateService: TemplateService,
    private router: Router
  ) {
    this.surveyForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      expires_delta: [null],
      prevent_duplicates: [true],
      status: [SurveyStatus.PRIVATE]
    });
    this.questionsForm = this.fb.group({
      questions: this.fb.array([])
    });
    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: [TemplateCategory.CUSTOM, Validators.required]
    });
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { template?: SurveyTemplate };

    if (state?.template) {
      this.loadedTemplate = state.template;
    }
  }

  ngOnInit(): void {
    const storedTemplate = sessionStorage.getItem('selectedTemplate');

    if (storedTemplate) {
      try {
        this.loadedTemplate = JSON.parse(storedTemplate);
        sessionStorage.removeItem('selectedTemplate');
        this.creationMethod = 'template';
        this.currentStep = 1;
      } catch (e) {
      }
    }

    if (this.loadedTemplate) {
      this.loadTemplateData(this.loadedTemplate);
    }
  }

  selectMethod(method: 'blank' | 'template' | 'duplicate'): void {
    this.creationMethod = method;

    if (method === 'blank') {
      this.currentStep = 1;
    } else if (method === 'template') {
      this.router.navigate(['/templates']);
    } else if (method === 'duplicate') {
      this.router.navigate(['/surveys'], {
        queryParams: { mode: 'duplicate' }
      });
    }
  }

  get questions(): FormArray {
    return this.questionsForm.get('questions') as FormArray;
  }

  createQuestion(): FormGroup {
    return this.fb.group({
      content: ['', Validators.required],
      position: [this.questions.length],
      answer_type: [AnswerType.OPEN, Validators.required],
      choices: this.fb.array([]),
      settings: this.fb.group({
        min: [1],
        max: [5],
        step: [1],
        required: [false],
        placeholder: ['']
      })
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
    this.updatePositions();
  }

  getChoices(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('choices') as FormArray;
  }

  addChoice(questionIndex: number): void {
    const choices = this.getChoices(questionIndex);
    choices.push(this.fb.group({
      content: ['', Validators.required],
      position: [choices.length]
    }));
  }

  removeChoice(questionIndex: number, choiceIndex: number): void {
    this.getChoices(questionIndex).removeAt(choiceIndex);
    this.updateChoicePositions(questionIndex);
  }

  updatePositions(): void {
    this.questions.controls.forEach((q, i) => {
      q.get('position')?.setValue(i);
    });
  }

  updateChoicePositions(questionIndex: number): void {
    const choices = this.getChoices(questionIndex);
    choices.controls.forEach((c, i) => {
      c.get('position')?.setValue(i);
    });
  }

  onAnswerTypeChange(questionIndex: number): void {
    const question = this.questions.at(questionIndex);
    const answerType = question.get('answer_type')?.value;
    const choices = this.getChoices(questionIndex);

    while (choices.length) {
      choices.removeAt(0);
    }

    if (answerType === AnswerType.CLOSE || answerType === AnswerType.MULTIPLE || answerType === AnswerType.DROPDOWN) {
      this.addChoice(questionIndex);
      this.addChoice(questionIndex);
    }
    const settings = question.get('settings');

    if (answerType === AnswerType.SCALE) {
      settings?.patchValue({ min: 1, max: 5, step: 1 });
    } else if (answerType === AnswerType.RATING) {
      settings?.patchValue({ min: 1, max: 5, step: 1 });
    }
  }

  needsChoices(answerType: string): boolean {
    return answerType === AnswerType.CLOSE ||
           answerType === AnswerType.MULTIPLE ||
           answerType === AnswerType.DROPDOWN;
  }

  needsSettings(answerType: string): boolean {
    return answerType === AnswerType.SCALE ||
           answerType === AnswerType.RATING;
  }

  getAnswerTypeLabel(type: AnswerType): string {
    const labels: Record<AnswerType, string> = {
      [AnswerType.OPEN]: 'Otwarta (tekst)',
      [AnswerType.CLOSE]: 'Jednokrotnego wyboru',
      [AnswerType.MULTIPLE]: 'Wielokrotnego wyboru',
      [AnswerType.SCALE]: 'Skala (1-5)',
      [AnswerType.RATING]: 'Ocena gwiazdkowa',
      [AnswerType.YES_NO]: 'Tak/Nie',
      [AnswerType.DROPDOWN]: 'Lista rozwijana',
      [AnswerType.DATE]: 'Data',
      [AnswerType.EMAIL]: 'Email',
      [AnswerType.NUMBER]: 'Liczba'
    };
    return labels[type] || type;
  }

  createSurvey(): void {

    if (this.surveyForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      const surveyData = {
        name: this.surveyForm.value.name,
        expires_delta: undefined,
        prevent_duplicates: true,
        status: SurveyStatus.PRIVATE
      };
      this.surveyService.createSurvey(surveyData).subscribe({
        next: (survey) => {
          this.createdSurveyId = survey.id;
          this.currentStep = 2;

          if (this.questions.length === 0) {
            this.addQuestion();
          }
          this.loading = false;
        },
        error: (error) => {

          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.detail) {
            if (Array.isArray(error.error.detail)) {
              this.errorMessage = error.error.detail.map((e: any) => e.msg).join(', ');
            } else {
              this.errorMessage = error.error.detail;
            }
          } else {
            this.errorMessage = 'Błąd podczas tworzenia ankiety';
          }
          this.loading = false;
        }
      });
    }
  }

  saveQuestions(): void {

    if (this.questionsForm.valid && this.createdSurveyId) {
      this.loading = true;
      this.errorMessage = '';
      const questions = this.questionsForm.value.questions.map((q: any) => {
        const question: any = {
          content: q.content,
          position: q.position,
          answer_type: q.answer_type
        };

        if (q.answer_type !== AnswerType.OPEN && q.choices && q.choices.length > 0) {
          question.choices = q.choices;
        }
        return question;
      });
      this.surveyService.createOrUpdateQuestions(this.createdSurveyId, questions).subscribe({
        next: () => {
          this.navigationApproved = true;
          this.router.navigate(['/surveys']);
        },
        error: (error) => {

          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.detail) {
            if (Array.isArray(error.error.detail)) {
              this.errorMessage = error.error.detail.map((e: any) => e.msg).join(', ');
            } else {
              this.errorMessage = error.error.detail;
            }
          } else {
            this.errorMessage = 'Błąd podczas zapisywania pytań';
          }
          this.loading = false;
        }
      });
    }
  }

  loadTemplateData(template: SurveyTemplate): void {
    this.surveyForm.patchValue({
      name: `${template.name} (kopia)`
    });
    if (template.questions_data && Array.isArray(template.questions_data)) {
      template.questions_data.forEach((q: any, index: number) => {
        const question = this.createQuestion();
        question.patchValue({
          content: q.content,
          answer_type: q.answer_type,
          settings: q.settings || {}
        });
        if (q.choices && Array.isArray(q.choices) && q.choices.length > 0) {
          const choicesArray = question.get('choices') as FormArray;
          q.choices.forEach((choice: any) => {
            choicesArray.push(this.fb.group({
              content: [choice.content, Validators.required],
              position: [choice.position]
            }));
          });
        }
        this.questions.push(question);
      });
    } else {
    }
  }

  openSaveAsTemplateModal(): void {
    this.showSaveAsTemplateModal = true;
  }

  closeSaveAsTemplateModal(): void {
    this.showSaveAsTemplateModal = false;
    this.templateForm.reset({
      name: '',
      description: '',
      category: TemplateCategory.CUSTOM
    });
    this.templateErrorMessage = '';
  }

  cancelSurveyCreation(): void {

    if (this.createdSurveyId) {
      this.showCancelConfirmModal = true;
    } else {
      this.navigationApproved = true;
      this.router.navigate(['/surveys']);
    }
  }

  confirmCancelSurvey(): void {

    if (this.createdSurveyId) {
      this.surveyService.deleteSurvey(this.createdSurveyId).subscribe({
        next: () => {
          this.showCancelConfirmModal = false;
          this.navigationApproved = true;
          this.router.navigate(['/surveys']);
        },
        error: (error) => {
          this.showCancelConfirmModal = false;
          this.navigationApproved = true;
          this.router.navigate(['/surveys']);
        }
      });
    }
  }

  closeCancelConfirmModal(): void {
    this.showCancelConfirmModal = false;
  }

  saveAsTemplate(): void {

    if (!this.templateForm.valid || this.questions.length === 0) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const questionsData = this.questionsForm.value.questions.map((q: any) => ({
      content: q.content,
      answer_type: q.answer_type,
      choices: q.choices || [],
      settings: q.settings || {}
    }));
    const templateData = {
      ...this.templateForm.value,
      is_public: false,
      questions_data: questionsData
    };
    this.templateService.createTemplate(templateData).subscribe({
      next: (response) => {
        this.successMessage = 'Szablon został zapisany!';
        this.loading = false;
        this.templateForm.reset({
          name: '',
          description: '',
          category: TemplateCategory.CUSTOM
        });
        this.templateErrorMessage = '';
        this.showSaveAsTemplateModal = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.templateErrorMessage = error.error?.detail || error.error?.message || 'Błąd podczas zapisywania szablonu';
        this.loading = false;
      }
    });
  }

  get TemplateCategory() {
    return TemplateCategory;
  }

  canDeactivate(): boolean | Observable<boolean> {

    if (this.navigationApproved) {
      return true;
    }

    if (this.createdSurveyId && this.currentStep === 2) {
      this.navigationConfirmSubject = new Subject<boolean>();
      this.showNavigationConfirmModal = true;
      return this.navigationConfirmSubject.asObservable();
    }
    return true;
  }

  confirmNavigation(confirmed: boolean): void {
    this.showNavigationConfirmModal = false;

    if (confirmed && this.createdSurveyId) {
      this.surveyService.deleteSurvey(this.createdSurveyId).subscribe({
        next: () => {

          if (this.navigationConfirmSubject) {
            this.navigationConfirmSubject.next(true);
            this.navigationConfirmSubject.complete();
          }
        },
        error: (err) => {

          if (this.navigationConfirmSubject) {
            this.navigationConfirmSubject.next(true);
            this.navigationConfirmSubject.complete();
          }
        }
      });
    } else {

      if (this.navigationConfirmSubject) {
        this.navigationConfirmSubject.next(false);
        this.navigationConfirmSubject.complete();
      }
    }
  }
}
