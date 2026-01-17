import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SurveyService } from '../../services/survey.service';
import { UserService } from '../../services/user.service';
import { Survey } from '../../models/survey.model';
import { User } from '../../models/user.model';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})


export class DashboardComponent implements OnInit {
  surveys: Survey[] = [];
  user: User | null = null;
  loading = true;
  constructor(
    private surveyService: SurveyService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
      }
    });
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

  get surveysCount(): number {
    return this.surveys.length;
  }

  get publicSurveysCount(): number {
    return this.surveys.filter(s => s.status === 'public').length;
  }

  get privateSurveysCount(): number {
    return this.surveys.filter(s => s.status === 'private').length;
  }
}
