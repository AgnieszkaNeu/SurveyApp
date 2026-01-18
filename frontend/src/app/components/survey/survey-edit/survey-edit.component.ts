import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { Survey, AnswerType } from '../../../models/survey.model';
import { Subject, interval } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'app-survey-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './survey-edit.component.html',
  styleUrls: ['./survey-edit.component.scss']
})


export class SurveyEditComponent implements OnInit, OnDestroy {
  survey: Survey | null = null;
  questionsForm: FormGroup;
  loading = true;
  saving = false;
  hasUnsavedChanges = false;
  saveStatus: 'saved' | 'unsaved' | 'saving' = 'saved';
  errorMessage = '';
  answerTypes = Object.values(AnswerType);
  AnswerType = AnswerType;
  questionToDelete: number | null = null;
  showDeleteModal = false;
  expandedQuestions: Set<number> = new Set();
  private destroy$ = new Subject<void>();
  private formChangeSubject = new Subject<any>();
  constructor(
    private fb: FormBuilder,
    private surveyService: SurveyService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.questionsForm = this.fb.group({
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const surveyId = this.route.snapshot.params['id'];
    this.loadSurvey(surveyId);
    this.setupAutoSave();
    this.setupFormChangeTracking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {

    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  get questions(): FormArray {
    return this.questionsForm.get('questions') as FormArray;
  }

  getChoices(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('choices') as FormArray;
  }

  loadSurvey(surveyId: string): void {
    this.surveyService.getSurveyById(surveyId).subscribe({
      next: (survey) => {
        this.survey = survey;
        this.setupForm();
        this.loadDraft(surveyId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Nie udało się załadować ankiety';
      }
    });
  }

  setupForm(): void {
    if (!this.survey) return;
    this.survey.questions.forEach(question => {
      this.questions.push(this.createQuestionGroup(question));
    });
  }

  createQuestionGroup(question?: any): FormGroup {
    return this.fb.group({
      id: [question?.id || null],
      content: [question?.content || '', Validators.required],
      position: [question?.position || this.questions.length],
      answer_type: [question?.answer_type || AnswerType.OPEN, Validators.required],
      is_required: [question?.is_required || false],
        choices: this.fb.array(
        question?.choices?.map((choice: any) =>
            this.fb.group({
            id: [choice.id || null],
              content: [choice.content, Validators.required],
              position: [choice.position]
            })
          ) || []
        )
      });
  }

  createChoiceGroup(choice?: any): FormGroup {
    return this.fb.group({
      id: [choice?.id || null],
      content: [choice?.content || '', Validators.required],
      position: [choice?.position || 0]
    });
  }

  setupFormChangeTracking(): void {
    this.questionsForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.hasUnsavedChanges = true;
        this.saveStatus = 'unsaved';
        this.formChangeSubject.next(this.questionsForm.value);
      });
  }

  setupAutoSave(): void {
    this.formChangeSubject
      .pipe(
        debounceTime(30000),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {

        if (this.survey) {
          this.saveDraft(this.survey.id, value);
        }
      });
  }

  saveDraft(surveyId: string, data: any): void {
    localStorage.setItem(`survey-draft-${surveyId}`, JSON.stringify(data));
  }

  loadDraft(surveyId: string): void {
    const draft = localStorage.getItem(`survey-draft-${surveyId}`);

    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        if (confirm('Znaleziono zapisaną wersję roboczą. Czy chcesz ją przywrócić?')) {
          this.questionsForm.patchValue(draftData);
          this.hasUnsavedChanges = true;
        }
      } catch (e) {
      }
    }
  }

  clearDraft(): void {

    if (this.survey) {
      localStorage.removeItem(`survey-draft-${this.survey.id}`);
    }
  }

  addQuestion(): void {
    const newQuestion = this.createQuestionGroup();
    this.questions.push(newQuestion);
    this.expandedQuestions.add(this.questions.length - 1);
    this.hasUnsavedChanges = true;
    this.saveStatus = 'unsaved';
    setTimeout(() => {
      const element = document.querySelector(`#question-${this.questions.length - 1}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  removeQuestion(index: number): void {
    const question = this.survey?.questions[index];
    const hasResponses = this.survey && this.survey.submission_count > 0;

    if (hasResponses && question) {
      this.questionToDelete = index;
      this.showDeleteModal = true;
    } else {
      this.questions.removeAt(index);
      this.expandedQuestions.delete(index);
      this.hasUnsavedChanges = true;
      this.saveStatus = 'unsaved';
    }
  }

  confirmDelete(): void {

    if (this.questionToDelete !== null) {
      this.questions.removeAt(this.questionToDelete);
      this.expandedQuestions.delete(this.questionToDelete);
      this.hasUnsavedChanges = true;
      this.saveStatus = 'unsaved';
      this.questionToDelete = null;
      this.showDeleteModal = false;
    }
  }

  cancelDelete(): void {
    this.questionToDelete = null;
    this.showDeleteModal = false;
  }

  duplicateQuestion(index: number): void {
    const questionToCopy = this.questions.at(index).value;
    const newQuestion = this.createQuestionGroup({
      ...questionToCopy,
      id: null,
      content: questionToCopy.content + ' (kopia)',
      position: index + 1
    });
    this.questions.insert(index + 1, newQuestion);
    this.expandedQuestions.add(index + 1);
    this.hasUnsavedChanges = true;
    this.saveStatus = 'unsaved';
  }

  toggleQuestion(index: number): void {
    if (this.expandedQuestions.has(index)) {
      this.expandedQuestions.delete(index);
    } else {
      this.expandedQuestions.add(index);
    }
  }

  isQuestionExpanded(index: number): boolean {
    return this.expandedQuestions.has(index);
  }

  addChoice(questionIndex: number): void {
    const choices = this.getChoices(questionIndex);
    const newChoice = this.createChoiceGroup({
      position: choices.length
    });
    choices.push(newChoice);
    this.hasUnsavedChanges = true;
    this.saveStatus = 'unsaved';
  }

  removeChoice(questionIndex: number, choiceIndex: number): void {
    const choices = this.getChoices(questionIndex);
    const hasResponses = this.survey && this.survey.submission_count > 0;

    if (hasResponses) {
      if (confirm('Ta opcja może być wybrana w odpowiedziach. Usunięcie jej może wpłynąć na integralność danych. Czy na pewno chcesz kontynuować?')) {
        choices.removeAt(choiceIndex);
        this.hasUnsavedChanges = true;
        this.saveStatus = 'unsaved';
      }
    } else {
      choices.removeAt(choiceIndex);
      this.hasUnsavedChanges = true;
      this.saveStatus = 'unsaved';
    }
  }

  needsChoices(answerType: string): boolean {
    return [AnswerType.CLOSE, AnswerType.MULTIPLE, AnswerType.DROPDOWN].includes(answerType as AnswerType);
  }

  onAnswerTypeChange(questionIndex: number, newType: string): void {
    const question = this.questions.at(questionIndex);
    const choices = this.getChoices(questionIndex);
    const hasResponses = this.survey && this.survey.submission_count > 0;
    if (hasResponses && question.get('answer_type')?.value !== newType) {
      if (!confirm('Zmiana typu pytania może wpłynąć na zebrane odpowiedzi. Czy na pewno chcesz kontynuować?')) {
        question.get('answer_type')?.setValue(question.get('answer_type')?.value, { emitEvent: false });
        return;
      }
    }
    if (this.needsChoices(newType) && choices.length === 0) {
      this.addChoice(questionIndex);
      this.addChoice(questionIndex);
    }
    this.hasUnsavedChanges = true;
    this.saveStatus = 'unsaved';
  }

  getAnswerTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      [AnswerType.OPEN]: 'Otwarte',
      [AnswerType.CLOSE]: 'Jednokrotny wybór',
      [AnswerType.MULTIPLE]: 'Wielokrotny wybór',
      [AnswerType.SCALE]: 'Skala',
      [AnswerType.RATING]: 'Ocena',
      [AnswerType.YES_NO]: 'Tak/Nie',
      [AnswerType.DROPDOWN]: 'Lista rozwijana',
      [AnswerType.DATE]: 'Data',
      [AnswerType.EMAIL]: 'Email',
      [AnswerType.NUMBER]: 'Liczba'
    };
    return labels[type] || type;
  }

  hasResponses(): boolean {
    return this.survey ? this.survey.submission_count > 0 : false;
  }

  saveQuestions(): void {

    if (this.questionsForm.invalid) {
      this.errorMessage = 'Popraw błędy walidacji przed zapisaniem';
      this.scrollToFirstError();
      return;
    }

    if (this.survey) {
      this.saving = true;
      this.saveStatus = 'saving';
      const questions = this.questionsForm.value.questions;
      this.surveyService.createOrUpdateQuestions(this.survey.id, questions).subscribe({
        next: () => {
          this.hasUnsavedChanges = false;
          this.saveStatus = 'saved';
          this.saving = false;
          this.clearDraft();
          setTimeout(() => {
            this.location.back();
          }, 500);
        },
        error: (error) => {
          this.errorMessage = 'Błąd podczas zapisywania zmian';
          this.saving = false;
          this.saveStatus = 'unsaved';
        }
      });
    }
  }

  cancel(): void {

    if (this.hasUnsavedChanges) {
      if (confirm('Masz niezapisane zmiany. Czy na pewno chcesz opuścić stronę?')) {
        this.clearDraft();
        this.location.back();
      }
    } else {
      this.location.back();
    }
  }

  scrollToFirstError(): void {
    const firstInvalid = document.querySelector('.is-invalid, .ng-invalid.ng-touched');

    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (firstInvalid as HTMLElement).focus();
    }
  }
}
