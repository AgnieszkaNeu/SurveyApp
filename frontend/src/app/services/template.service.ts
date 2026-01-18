import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SurveyTemplate, SurveyTemplateCreate } from '../models/survey.model';
@Injectable({
  providedIn: 'root'
})


export class TemplateService {
  private apiUrl = `${environment.apiUrl}/v1/templates`;

  constructor(private http: HttpClient) { }

  getPublicTemplates(): Observable<SurveyTemplate[]> {
    return this.http.get<SurveyTemplate[]>(`${this.apiUrl}/public`);
  }

  getMyTemplates(): Observable<SurveyTemplate[]> {
    return this.http.get<SurveyTemplate[]>(`${this.apiUrl}/my`);
  }

  getTemplate(id: string): Observable<SurveyTemplate> {
    return this.http.get<SurveyTemplate>(`${this.apiUrl}/${id}`);
  }

  createTemplate(template: SurveyTemplateCreate): Observable<SurveyTemplate> {
    return this.http.post<SurveyTemplate>(this.apiUrl, template);
  }

  useTemplate(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/use`, {});
  }

  deleteTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
