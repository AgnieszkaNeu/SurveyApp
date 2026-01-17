import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { ThemeService } from '../../../services/theme.service';
import { ChartThemeService } from '../../../services/chart-theme.service';
import { ToastService } from '../../../services/toast.service';
import { Survey, Submission, Question, AnswerType } from '../../../models/survey.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
Chart.register(...registerables);


interface QuestionStats {
  question: Question;
  totalResponses: number;
  chartData: ChartConfiguration | null;
  responses: string[];
}
@Component({
  selector: 'app-survey-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './survey-results.component.html',
  styleUrls: ['./survey-results.component.scss']
})


export class SurveyResultsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('chartCanvas') chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  survey: Survey | null = null;
  submissions: Submission[] = [];
  loading = true;
  questionStats: QuestionStats[] = [];
  charts: Chart[] = [];
  AnswerType = AnswerType;
  Math = Math;
  exportingCSV = false;
  exportingPDF = false;
  showExportDropdown = false;
  private themeSubscription?: Subscription;
  currentPage = 1;
  itemsPerPage = 20;

  get pagedSubmissions(): Submission[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.submissions.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.submissions.length / this.itemsPerPage);
  }

  goToPage(page: number): void {

    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      document.querySelector('.raw-data-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {

      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {

      if (this.currentPage <= 3) {
        pages.push(1, 2, 3, 4, -1, this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1, -1, this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages);
      } else {
        pages.push(1, -1, this.currentPage - 1, this.currentPage, this.currentPage + 1, -1, this.totalPages);
      }
    }
    return pages;
  }
  constructor(
    private surveyService: SurveyService,
    private themeService: ThemeService,
    private chartThemeService: ChartThemeService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const surveyId = this.route.snapshot.params['id'];
    this.loadData(surveyId);
    this.themeSubscription = this.themeService.themeChange$.subscribe(() => {

      if (this.charts.length > 0) {
        this.updateChartsTheme();
      }
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  loadData(surveyId: string): void {
    this.surveyService.getSurveyById(surveyId).subscribe({
      next: (survey) => {
        this.survey = survey;
        this.loadSubmissions(surveyId);
      }
    });
  }

  loadSubmissions(surveyId: string): void {
    this.surveyService.getSurveySubmissions(surveyId).subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.calculateStats();
        this.loading = false;
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    if (!this.survey) return;
    this.questionStats = this.survey.questions.map(question => {
      const responses = this.submissions
        .flatMap(sub => sub.answers)
        .filter(ans => ans.question_id === question.id)
        .map(ans => ans.response);
      const totalResponses = responses.length;
      let chartData: ChartConfiguration | null = null;

      if (question.answer_type === AnswerType.CLOSE) {
        chartData = this.createPieChart(question, responses);
      } else if (question.answer_type === AnswerType.MULTIPLE) {
        chartData = this.createBarChart(question, responses);
      }
      return {
        question,
        totalResponses,
        chartData,
        responses
      };
    });
  }

  createPieChart(question: Question, responses: string[]): ChartConfiguration {
    const counts: { [key: string]: number } = {};
    responses.forEach(response => {
      counts[response] = (counts[response] || 0) + 1;
    });
    const labelsCount = Object.keys(counts).length;
    const theme = this.chartThemeService.getChartThemeConfig();
    return {
      type: 'pie',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: this.chartThemeService.getChartColors(labelsCount),
          borderWidth: 2,
          borderColor: theme.borderColor
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: theme.textColor,
              font: {
                size: 12
              },
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: theme.tooltipBackgroundColor,
            borderColor: theme.tooltipBorderColor,
            borderWidth: 1,
            titleColor: theme.textColor,
            bodyColor: theme.textColor,
            padding: 12,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = responses.length;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };
  }

  createBarChart(question: Question, responses: string[]): ChartConfiguration {
    const counts: { [key: string]: number } = {};
    responses.forEach(response => {
      const choices = response.split(',').map(c => c.trim());
      choices.forEach(choice => {
        counts[choice] = (counts[choice] || 0) + 1;
      });
    });
    const theme = this.chartThemeService.getChartThemeConfig();
    const maxValue = Math.max(...Object.values(counts));
    const stepSize = Math.max(1, Math.ceil(maxValue / 10));
    return {
      type: 'bar',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          label: 'Liczba odpowiedzi',
          data: Object.values(counts),
          backgroundColor: theme.primaryColor,
          borderColor: theme.primaryColor,
          borderWidth: 0,
          borderRadius: 6,
          barThickness: 'flex',
          maxBarThickness: 60
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: stepSize,
              color: theme.textColor,
              font: {
                size: 11
              }
            },
            grid: {
              color: theme.gridColor
            },
            border: {
              display: false
            }
          },
          x: {
            ticks: {
              color: theme.textColor,
              font: {
                size: 11
              },
              maxRotation: 45,
              minRotation: 0
            },
            grid: {
              display: false
            },
            border: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: theme.tooltipBackgroundColor,
            borderColor: theme.tooltipBorderColor,
            borderWidth: 1,
            titleColor: theme.textColor,
            bodyColor: theme.textColor,
            padding: 12,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y || 0;
                const total = Object.values(counts).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value} odpowiedzi (${percentage}%)`;
              }
            }
          }
        }
      }
    };
  }

  renderCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
    this.chartCanvases.forEach((canvasRef, index) => {
      const stat = this.questionStats[index];

      if (stat && stat.chartData) {
        const ctx = canvasRef.nativeElement.getContext('2d');

        if (ctx) {
          const chart = new Chart(ctx, stat.chartData);
          this.charts.push(chart);
        }
      }
    });
  }

  updateChartsTheme(): void {
    const theme = this.chartThemeService.getChartThemeConfig();
    this.charts.forEach((chart, index) => {
      const stat = this.questionStats[index];
      if (!stat || !chart.data.datasets[0]) return;
      const labelsCount = chart.data.labels?.length || 10;
      const chartType = (chart.config as any).type;
      chart.data.datasets[0].backgroundColor =
        chartType === 'pie'
          ? this.chartThemeService.getChartColors(labelsCount)
          : theme.primaryColor;
      chart.data.datasets[0].borderColor =
        chartType === 'pie'
          ? theme.borderColor
          : theme.primaryColor;

      if (chart.options?.scales) {
        ['x', 'y'].forEach(axis => {

          if (chart.options!.scales![axis]) {

            if (chart.options!.scales![axis]!.ticks) {
              chart.options!.scales![axis]!.ticks!.color = theme.textColor;
            }

            if (chart.options!.scales![axis]!.grid) {
              chart.options!.scales![axis]!.grid!.color = theme.gridColor;
            }
          }
        });
      }

      if (chart.options?.plugins?.legend?.labels) {
        chart.options.plugins.legend.labels.color = theme.textColor;
      }

      if (chart.options?.plugins?.tooltip) {
        chart.options.plugins.tooltip.backgroundColor = theme.tooltipBackgroundColor;
        chart.options.plugins.tooltip.borderColor = theme.tooltipBorderColor;
        chart.options.plugins.tooltip.titleColor = theme.textColor;
        chart.options.plugins.tooltip.bodyColor = theme.textColor;
      }
      chart.update('none');
    });
  }

  getQuestionById(questionId: string) {
    return this.survey?.questions.find(q => q.id === questionId);
  }

  countResponsesFor(responses: string[], choiceContent: string): number {
    return responses.filter(r => r.includes(choiceContent)).length;
  }

  calculatePercentage(count: number, total: number): number {
    return total > 0 ? (count / total) * 100 : 0;
  }

  getCompletionRate(): number {
    if (!this.survey || this.submissions.length === 0) return 0;
    const totalPossibleAnswers = this.submissions.length * this.survey.questions.length;
    const totalActualAnswers = this.submissions.reduce((sum, submission) =>
      sum + submission.answers.length, 0
    );
    return totalPossibleAnswers > 0
      ? Math.round((totalActualAnswers / totalPossibleAnswers) * 100)
      : 0;
  }

  getAvgResponseTime(): string {

    if (!this.submissions || this.submissions.length === 0) {
      return 'N/A';
    }
    if (!this.survey) return 'N/A';
    const openQuestions = this.survey.questions.filter(q => q.answer_type === 'open').length;
    const closedQuestions = this.survey.questions.length - openQuestions;
    const estimatedMinutes = (openQuestions * 0.5 + closedQuestions * 0.17);
    return estimatedMinutes >= 1
      ? `${estimatedMinutes.toFixed(1)}m`
      : `${Math.round(estimatedMinutes * 60)}s`;
  }

  exportToCSV(): void {

    if (!this.survey || this.submissions.length === 0) {
      this.toastService.warning('Brak danych do eksportu');
      return;
    }
    this.exportingCSV = true;
    setTimeout(() => {
      let csv = 'Data wypełnienia,';
      this.survey!.questions.forEach(q => {
        csv += `"${q.content}",`;
      });
      csv += '\n';
      this.submissions.forEach(submission => {
        const submissionDate = submission.created_at || new Date();
        csv += `"${new Date(submissionDate).toLocaleString('pl-PL')}",`;
        this.survey!.questions.forEach(question => {
          const answer = submission.answers.find(a => a.question_id === question.id);
          csv += `"${answer?.response || ''}",`;
        });
        csv += '\n';
      });
      this.downloadFile(csv, `ankieta-${this.survey!.name}-wyniki.csv`, 'text/csv');
      this.exportingCSV = false;
    }, 100);
  }

  exportToPDF(): void {

    if (!this.survey || this.submissions.length === 0) {
      this.toastService.warning('Brak danych do eksportu');
      return;
    }
    this.exportingPDF = true;
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        doc.setFontSize(18);
        const surveyName = (this.survey!.name || 'Ankieta').trim();
        doc.text('Wyniki: ' + surveyName, 14, 20);
        doc.setFontSize(12);
        doc.text('Liczba odpowiedzi: ' + this.submissions.length, 14, 30);
        doc.text('Liczba pytań: ' + this.survey!.questions.length, 14, 37);
        let yPos = 50;
        this.questionStats.forEach((stat, index) => {

          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFontSize(14);
          const questionText = (index + 1) + '. ' + stat.question.content;
          doc.text(questionText, 14, yPos);
          yPos += 10;
          const hasChoices = stat.question.choices && Array.isArray(stat.question.choices) && stat.question.choices.length > 0;

          if (stat.question.answer_type !== AnswerType.OPEN && hasChoices) {
            const tableData = stat.question.choices!.map(choice => {
              const count = this.countResponsesFor(stat.responses, choice.content);
              const percentage = this.calculatePercentage(count, stat.totalResponses).toFixed(1);
              return [choice.content, count.toString(), percentage + '%'];
            });
            autoTable(doc, {
              startY: yPos,
              head: [['Odpowiedź', 'Liczba', '%']],
              body: tableData,
              theme: 'grid',
              styles: { fontSize: 10 }
            });
            yPos = (doc as any).lastAutoTable.finalY + 15;
          } else {
            doc.setFontSize(10);
            const responsesToShow = (stat.responses || []).slice(0, 10);
            responsesToShow.forEach(response => {

              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              const text = response ? String(response).substring(0, 80) : '(brak)';
              doc.text('- ' + text, 20, yPos);
              yPos += 7;
            });

            if (stat.responses.length > 10) {
              doc.text('... i ' + (stat.responses.length - 10) + ' więcej', 20, yPos);
            }
            yPos += 15;
          }
        });
        const sanitizedName = surveyName
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 30);
        const filename = sanitizedName + '-wyniki.pdf';
        doc.save(filename);
        this.exportingPDF = false;
        this.toastService.success('PDF został wygenerowany');
      } catch (error: any) {
        this.exportingPDF = false;
        this.toastService.error('Błąd podczas generowania PDF: ' + (error?.message || 'Nieznany błąd'));
      }
    }, 100);
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  copyResultsToClipboard(): void {

    if (!this.survey || this.submissions.length === 0) {
      this.toastService.warning('Brak danych do skopiowania');
      return;
    }
    let text = `Wyniki ankiety: ${this.survey.name}\n`;
    text += `${'='.repeat(60)}\n\n`;
    text += `Liczba odpowiedzi: ${this.submissions.length}\n`;
    text += `Liczba pytań: ${this.survey.questions.length}\n`;
    text += `Kompletność: ${this.getCompletionRate()}%\n\n`;
    text += `${'='.repeat(60)}\n\n`;
    this.questionStats.forEach((stat, index) => {
      text += `${index + 1}. ${stat.question.content}\n`;
      text += `Typ: ${this.getAnswerTypeLabel(stat.question.answer_type)}\n`;
      text += `Odpowiedzi: ${stat.totalResponses}\n`;

      if (stat.question.answer_type !== AnswerType.OPEN && stat.question.choices) {
        text += `\nRozkład odpowiedzi:\n`;
        stat.question.choices.forEach(choice => {
          const count = this.countResponsesFor(stat.responses, choice.content);
          const percentage = this.calculatePercentage(count, stat.totalResponses).toFixed(1);
          text += `  - ${choice.content}: ${count} (${percentage}%)\n`;
        });
      }
      text += `\n${'-'.repeat(60)}\n\n`;
    });
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.success('Wyniki skopiowane do schowka');
      this.showExportDropdown = false;
    }).catch(() => {
      this.toastService.error('Nie udało się skopiować do schowka');
    });
  }

  toggleExportDropdown(): void {
    this.showExportDropdown = !this.showExportDropdown;
  }

  closeExportDropdown(): void {
    this.showExportDropdown = false;
  }
  handleExportAction(action: () => void): void {
    action();
    this.showExportDropdown = false;
  }

  private getAnswerTypeLabel(type: AnswerType): string {
    const labels: Record<AnswerType, string> = {
      [AnswerType.OPEN]: 'Otwarta',
      [AnswerType.CLOSE]: 'Jednokrotnego wyboru',
      [AnswerType.MULTIPLE]: 'Wielokrotnego wyboru',
      [AnswerType.SCALE]: 'Skala',
      [AnswerType.RATING]: 'Ocena gwiazdkowa',
      [AnswerType.YES_NO]: 'Tak/Nie',
      [AnswerType.DROPDOWN]: 'Lista rozwijana',
      [AnswerType.DATE]: 'Data',
      [AnswerType.EMAIL]: 'Email',
      [AnswerType.NUMBER]: 'Liczba'
    };
    return labels[type] || type;
  }
}
