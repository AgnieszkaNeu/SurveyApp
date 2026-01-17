import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { Survey } from '../../../models/survey.model';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-public-surveys',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-surveys.component.html',
  styleUrls: ['./public-surveys.component.scss']
})


export class PublicSurveysComponent implements OnInit {
  surveys: Survey[] = [];
  loading = true;
  errorMessage = '';
  constructor(
    private surveyService: SurveyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPublicSurveys();
  }

  loadPublicSurveys(): void {
    this.surveyService.getPublicSurveys().subscribe({
      next: (surveys) => {
        this.surveys = surveys;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Nie udało się załadować publicznych ankiet';
        this.loading = false;
      }
    });
  }

  isAlreadySubmitted(surveyId: string): boolean {
    try {
      const storageKey = this.getStorageKey();
      const submitted = localStorage.getItem(storageKey);

      if (submitted) {
        const submittedSurveys = JSON.parse(submitted);
        return submittedSurveys.includes(surveyId);
      }
    } catch (error) {
    }
    return false;
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

  isExpiringSoon(survey: Survey): boolean {
    if (!survey.expires_at) return false;
    const now = new Date();
    const expiryDate = new Date(survey.expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }

  getExpiryText(survey: Survey): string {
    if (!survey.expires_at) return 'Bez terminu';
    const now = new Date();
    const expiryDate = new Date(survey.expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return 'Wygasła';
    if (daysUntilExpiry === 0) return 'Wygasa dziś';
    if (daysUntilExpiry === 1) return 'Wygasa jutro';
    if (daysUntilExpiry <= 7) return `Wygasa za ${daysUntilExpiry} dni`;
    return `Wygasa ${expiryDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}`;
  }
}
