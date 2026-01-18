import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Survey, SurveyCreate, QuestionCreate, Question, SubmissionCreate, Submission, ShareLink, ShareLinkCreate, SurveyStatus } from '../models/survey.model';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})


export class SurveyService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createSurvey(survey: SurveyCreate): Observable<Survey> {
    return this.http.post<Survey>(`${this.API_URL}/v1/survey/`, survey);
  }

  getAllUserSurveys(): Observable<Survey[]> {
    return this.http.get<Survey[]>(`${this.API_URL}/v1/survey/`);
  }

  getSurveyById(surveyId: string): Observable<Survey> {
    return this.http.get<Survey>(`${this.API_URL}/v1/survey/${surveyId}`);
  }

  getSurveyByToken(token: string): Observable<Survey> {
    return this.http.get<Survey>(`${this.API_URL}/v1/share/token/${token}/survey`);
  }

  getPublicSurveys(): Observable<Survey[]> {
    return this.http.get<Survey[]>(`${this.API_URL}/v1/survey/public`);
  }

  getPublicSurveyById(surveyId: string): Observable<Survey> {
    return this.http.get<Survey>(`${this.API_URL}/v1/survey/${surveyId}/public`);
  }

  getSurveyByName(name: string): Observable<Survey[]> {
    return this.http.get<Survey[]>(`${this.API_URL}/v1/survey/name/${name}`);
  }

  deleteSurvey(surveyId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/v1/survey/${surveyId}`);
  }

  updateSurveyStatus(surveyId: string, status: SurveyStatus): Observable<Survey> {
    return this.http.patch<Survey>(`${this.API_URL}/v1/survey/${surveyId}/status`, { status });
  }

  checkAlreadySubmitted(surveyId: string, fingerprintAdvanced?: string): Observable<{ already_submitted: boolean }> {
    return this.http.post<{ already_submitted: boolean }>(
      `${this.API_URL}/v1/submissions/check-duplicate/${surveyId}`,
      { fingerprint_advanced: fingerprintAdvanced }
    );
  }

  createOrUpdateQuestions(surveyId: string, questions: QuestionCreate[]): Observable<Question[]> {
    return this.http.post<Question[]>(`${this.API_URL}/v1/question/${surveyId}/`, questions);
  }

  getQuestionsForSurvey(surveyId: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.API_URL}/v1/question/${surveyId}/`);
  }

  submitSurvey(submission: SubmissionCreate): Observable<any> {
    return this.http.post(`${this.API_URL}/v1/submissions/`, submission);
  }

  getSurveySubmissions(surveyId: string): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.API_URL}/v1/submissions/survey/${surveyId}`);
  }

  createShareLink(surveyId: string, shareLinkCreate: ShareLinkCreate): Observable<ShareLink> {
    return this.http.post<ShareLink>(`${this.API_URL}/v1/share/${surveyId}`, shareLinkCreate);
  }

  getShareLinksForSurvey(surveyId: string): Observable<ShareLink[]> {
    return this.http.get<ShareLink[]>(`${this.API_URL}/v1/share/survey/${surveyId}`);
  }

  deleteShareLink(linkId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/v1/share/${linkId}`);
  }
}
