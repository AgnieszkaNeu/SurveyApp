import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { Survey, SurveyStatus } from '../../../models/survey.model';
@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss']
})


export class SurveyListComponent implements OnInit {
  surveys: Survey[] = [];
  loading = true;
  deletingId: string | null = null;
  updatingStatusId: string | null = null;
  showDeleteModal = false;
  surveyToDelete: Survey | null = null;

  constructor(private surveyService: SurveyService) {}

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    this.surveyService.getAllUserSurveys().subscribe({
      next: (surveys) => {
        this.surveys = surveys;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  confirmDelete(survey: Survey): void {
    this.surveyToDelete = survey;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.surveyToDelete = null;
    this.showDeleteModal = false;
  }

  deleteSurvey(): void {
    if (!this.surveyToDelete) return;
    this.deletingId = this.surveyToDelete.id;
    this.surveyService.deleteSurvey(this.surveyToDelete.id).subscribe({
      next: () => {
        this.surveys = this.surveys.filter(s => s.id !== this.surveyToDelete!.id);
        this.deletingId = null;
        this.showDeleteModal = false;
        this.surveyToDelete = null;
      },
      error: (error) => {
        this.deletingId = null;
        alert('Nie udało się usunąć ankiety. Spróbuj ponownie.');
      }
    });
  }

  toggleStatus(survey: Survey): void {
    if (survey.status === 'expired') return;
    const newStatus = survey.status === 'public' ? SurveyStatus.PRIVATE : SurveyStatus.PUBLIC;
    this.updatingStatusId = survey.id;
    this.surveyService.updateSurveyStatus(survey.id, newStatus).subscribe({
      next: (updatedSurvey) => {
        const index = this.surveys.findIndex(s => s.id === survey.id);

        if (index !== -1) {
          this.surveys[index] = updatedSurvey;
        }
        this.updatingStatusId = null;
      },
      error: (error) => {
        this.updatingStatusId = null;
        alert('Nie udało się zaktualizować statusu ankiety.');
      }
    });
  }

  isExpiringSoon(survey: Survey): boolean {
    if (!survey.expires_at || survey.status === 'expired') return false;
    const now = new Date();
    const expiryDate = new Date(survey.expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }

  getExpiryText(survey: Survey): string {
    if (!survey.expires_at) return 'Bez terminu';
    if (survey.status === 'expired') return 'Wygasła';
    const now = new Date();
    const expiryDate = new Date(survey.expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return 'Wygasła';
    if (daysUntilExpiry === 0) return 'Wygasa dziś';
    if (daysUntilExpiry === 1) return 'Wygasa jutro';
    if (daysUntilExpiry <= 7) return `Wygasa za ${daysUntilExpiry} dni`;
    return `Wygasa ${expiryDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}`;
  }

  copyShareLink(survey: Survey): void {
    const link = `${window.location.origin}/survey/${survey.id}/fill`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link skopiowany do schowka!');
    }).catch(err => {
      alert('Nie udało się skopiować linku');
    });
  }

  shareSurvey(survey: Survey): void {
    const link = `${window.location.origin}/survey/${survey.id}/fill`;

    if (navigator.share) {
      navigator.share({
        title: survey.name,
        text: 'Wypełnij ankietę:',
        url: link
      }).catch(err => {

        if (err.name !== 'AbortError') {
          this.copyShareLink(survey);
        }
      });
    } else {
      this.copyShareLink(survey);
    }
  }
}
