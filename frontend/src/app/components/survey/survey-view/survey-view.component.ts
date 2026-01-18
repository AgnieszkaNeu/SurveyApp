import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { ToastService } from '../../../services/toast.service';
import { Survey, ShareLink } from '../../../models/survey.model';
import QRCode from 'qrcode';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-survey-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './survey-view.component.html',
  styleUrls: ['./survey-view.component.scss']
})


export class SurveyViewComponent implements OnInit, OnDestroy {
  survey: Survey | null = null;
  loading = true;
  shareLinks: ShareLink[] = [];
  loadingShareLinks = false;
  creatingShareLink = false;
  showShareModal = false;
  qrCodeDataUrl: string | null = null;
  currentQRToken: string | null = null;
  private lastFocusedElement: HTMLElement | null = null;
  private refreshInterval: any;
  activeTab: 'preview' | 'share' = 'preview';
  viewportMode: 'desktop' | 'mobile' = 'desktop';
  previewMode = true;
  constructor(
    private surveyService: SurveyService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const surveyId = this.route.snapshot.params['id'];
    this.surveyService.getSurveyById(surveyId).subscribe({
      next: (survey) => {
        this.survey = survey;
        this.loading = false;
        this.loadShareLinks();
        this.startAutoRefresh();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.loadShareLinks(true);
    }, 10000);
  }

  private stopAutoRefresh(): void {

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadShareLinks(silent: boolean = false): void {
    if (!this.survey) return;

    if (!silent) {
      this.loadingShareLinks = true;
    }
    this.surveyService.getShareLinksForSurvey(this.survey.id).subscribe({
      next: (links) => {
        this.shareLinks = links;
        this.loadingShareLinks = false;
      },
      error: () => {
        this.loadingShareLinks = false;
      }
    });
  }

  createShareLink(): void {
    if (!this.survey) return;
    this.creatingShareLink = true;
    this.surveyService.createShareLink(this.survey.id, { is_active: true }).subscribe({
      next: (newLink) => {
        this.shareLinks.push(newLink);
        this.creatingShareLink = false;
        this.toastService.success('Link utworzony pomyślnie');
      },
      error: () => {
        this.creatingShareLink = false;
        this.toastService.error('Nie udało się utworzyć linku udostępniania');
      }
    });
  }

  getShareUrl(token: string): string {
    return `${window.location.origin}/survey/fill/${token}`;
  }

  async copyShareLink(token: string): Promise<void> {
    const url = this.getShareUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      this.toastService.success('Link skopiowany do schowka');
    } catch (err) {
      this.toastService.error('Nie udało się skopiować linku');
    }
  }

  async generateQRCode(token: string): Promise<void> {
    const url = this.getShareUrl(token);
    this.lastFocusedElement = document.activeElement as HTMLElement;
    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#4f46e5',
          light: '#ffffff'
        }
      });
      this.currentQRToken = token;
      this.showShareModal = true;
      setTimeout(() => {
        document.querySelector<HTMLElement>('.modal.show')?.focus();
      }, 100);
    } catch (err) {
      this.toastService.error('Nie udało się wygenerować kodu QR');
    }
  }

  downloadQRCode(): void {
    if (!this.qrCodeDataUrl || !this.currentQRToken) return;
    const link = document.createElement('a');
    link.href = this.qrCodeDataUrl;
    link.download = `ankieta-qr-${this.currentQRToken}.png`;
    link.click();
    this.toastService.success('Kod QR został pobrany');
  }

  closeShareModal(): void {
    this.showShareModal = false;
    this.qrCodeDataUrl = null;
    this.currentQRToken = null;
    setTimeout(() => {
      this.lastFocusedElement?.focus();
      this.lastFocusedElement = null;
    }, 100);
  }

  handleKeyDown(event: KeyboardEvent): void {

    if (event.key === 'Escape' && this.showShareModal) {
      this.closeShareModal();
    }
  }

  deleteShareLink(linkId: string): void {
    if (!confirm('Czy na pewno chcesz usunąć ten link udostępniania?')) return;
    this.surveyService.deleteShareLink(linkId).subscribe({
      next: () => {
        this.shareLinks = this.shareLinks.filter(link => link.id !== linkId);
        this.toastService.success('Link został usunięty');
      },
      error: () => {
        this.toastService.error('Nie udało się usunąć linku');
      }
    });
  }

  setActiveTab(tab: 'preview' | 'share'): void {
    this.activeTab = tab;

    if (tab === 'share' && !this.shareLinks.length) {
      this.loadShareLinks();
    }
  }

  setViewportMode(mode: 'desktop' | 'mobile'): void {
    this.viewportMode = mode;
  }

  goToEdit(): void {

    if (this.survey) {
      window.location.href = `/survey/${this.survey.id}/edit`;
    }
  }

  getAnswerTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'open': 'Otwarta (tekst)',
      'close': 'Jednokrotnego wyboru',
      'multiple': 'Wielokrotnego wyboru',
      'scale': 'Skala',
      'rating': 'Ocena gwiazdkowa',
      'yes_no': 'Tak/Nie',
      'dropdown': 'Lista rozwijana',
      'date': 'Data',
      'email': 'Email',
      'number': 'Liczba'
    };
    return labels[type] || type;
  }

  getEstimatedTime(): number {
    if (!this.survey || this.survey.questions.length === 0) return 0;
    const openQuestions = this.survey.questions.filter(q => q.answer_type === 'open').length;
    const closedQuestions = this.survey.questions.length - openQuestions;
    return Math.ceil((openQuestions * 0.5 + closedQuestions * 0.17));
  }
}
