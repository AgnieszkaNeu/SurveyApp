import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TemplateService } from '../../../services/template.service';
import { SurveyTemplate, TemplateCategory } from '../../../models/survey.model';
@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss']
})


export class TemplateListComponent implements OnInit {
  publicTemplates: SurveyTemplate[] = [];
  myTemplates: SurveyTemplate[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  activeTab: 'public' | 'my' = 'public';
  templateToDelete: SurveyTemplate | null = null;
  showDeleteModal = false;
  constructor(
    private templateService: TemplateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.error = null;
    this.templateService.getPublicTemplates().subscribe({
      next: (templates) => {
        this.publicTemplates = templates;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
    this.templateService.getMyTemplates().subscribe({
      next: (templates) => {
        this.myTemplates = templates;
      },
      error: (err) => {
      }
    });
  }

  useTemplate(template: SurveyTemplate): void {
    try {
      sessionStorage.setItem('selectedTemplate', JSON.stringify(template));
    } catch (e) {
      this.error = 'Nie udało się zapisać szablonu';
      return;
    }
    this.templateService.useTemplate(template.id).subscribe({
      next: () => {
        this.router.navigate(['/survey/create']);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Nie udało się użyć szablonu';
        sessionStorage.removeItem('selectedTemplate');
      }
    });
  }

  deleteTemplate(template: SurveyTemplate): void {
    this.templateToDelete = template;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.templateToDelete) return;
    this.templateService.deleteTemplate(this.templateToDelete.id).subscribe({
      next: () => {
        this.myTemplates = this.myTemplates.filter(t => t.id !== this.templateToDelete!.id);
        this.successMessage = 'Szablon został usunięty!';
        this.showDeleteModal = false;
        this.templateToDelete = null;
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        this.error = err.error?.detail || err.error?.message || 'Nie udało się usunąć szablonu';
        this.showDeleteModal = false;
        this.templateToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.templateToDelete = null;
  }

  getCategoryLabel(category: TemplateCategory): string {
    const labels: Record<TemplateCategory, string> = {
      [TemplateCategory.FEEDBACK]: 'Opinie',
      [TemplateCategory.QUIZ]: 'Quiz',
      [TemplateCategory.POLL]: 'Głosowanie',
      [TemplateCategory.RESEARCH]: 'Badanie',
      [TemplateCategory.EVENT]: 'Wydarzenie',
      [TemplateCategory.SATISFACTION]: 'Satysfakcja',
      [TemplateCategory.CUSTOM]: 'Własny'
    };
    return labels[category] || category;
  }

  getCategoryIcon(category: TemplateCategory): string {
    const icons: Record<TemplateCategory, string> = {
      [TemplateCategory.FEEDBACK]: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      `,
      [TemplateCategory.QUIZ]: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      `,
      [TemplateCategory.POLL]: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      `,
      [TemplateCategory.RESEARCH]: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      `,
      [TemplateCategory.EVENT]: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      `,
      [TemplateCategory.SATISFACTION]: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      `,
      [TemplateCategory.CUSTOM]: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      `
    };
    return icons[category] || icons[TemplateCategory.CUSTOM];
  }
}
