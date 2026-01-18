import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { PendingChangesGuard } from './guards/pending-changes.guard';
import { HomeComponent } from './components/shared/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ConfirmEmailComponent } from './components/auth/confirm-email/confirm-email.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SurveyListComponent } from './components/survey/survey-list/survey-list.component';
import { SurveyCreateComponent } from './components/survey/survey-create/survey-create.component';
import { SurveyFillComponent } from './components/survey/survey-fill/survey-fill.component';
import { SurveyViewComponent } from './components/survey/survey-view/survey-view.component';
import { SurveyEditComponent } from './components/survey/survey-edit/survey-edit.component';
import { SurveyResultsComponent } from './components/survey/survey-results/survey-results.component';
import { TemplateListComponent } from './components/survey/template-list/template-list.component';
import { PublicSurveysComponent } from './components/survey/public-surveys/public-surveys.component';
import { PrivacyPolicyComponent } from './components/shared/privacy-policy/privacy-policy.component';
import { PrivacySettingsComponent } from './components/shared/privacy-settings/privacy-settings.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'polityka-prywatnosci', component: PrivacyPolicyComponent },
  { path: 'ustawienia-prywatnosci', component: PrivacySettingsComponent },
  { path: 'survey/fill/:token', component: SurveyFillComponent },
  { path: 'survey/:id/fill-public', component: SurveyFillComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'surveys', component: SurveyListComponent, canActivate: [authGuard] },
  { path: 'surveys/public', component: PublicSurveysComponent, canActivate: [authGuard] },
  { path: 'templates', component: TemplateListComponent, canActivate: [authGuard] },
  { path: 'survey/create', component: SurveyCreateComponent, canActivate: [authGuard], canDeactivate: [PendingChangesGuard] },
  { path: 'survey/:id/edit', component: SurveyEditComponent, canActivate: [authGuard] },
  { path: 'survey/:id/results', component: SurveyResultsComponent, canActivate: [authGuard] },
  { path: 'survey/:id', component: SurveyViewComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
