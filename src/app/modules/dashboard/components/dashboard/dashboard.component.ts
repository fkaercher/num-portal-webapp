import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { AuthService } from 'src/app/core/auth/auth.service'
import { ContentService } from 'src/app/core/services/content/content.service'
import { AvailableRoles } from 'src/app/shared/models/available-roles.enum'
import { IDashboardCard } from 'src/app/shared/models/content/dashboard-card.interface'
import { AppConfigService } from '../../../../config/app-config.service'

@Component({
  selector: 'num-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription()
  AvailableRoles = AvailableRoles
  constructor(
    private appConfig: AppConfigService,
    private authService: AuthService,
    private contentService: ContentService,
    private translateService: TranslateService
  ) {}

  config = this.appConfig.config
  authTest: string
  cards: IDashboardCard[]
  displayLang: string
  isLoggedIn: boolean
  blocks: any[]

  @ViewChild('participantsAnchor') participantsAnchor: ElementRef

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn

    if (this.authService.isLoggedIn) {
      this.fetchContentCards()
      this.getCurrentLang()
    }

    this.blocks = this.translateService?.instant('DASHBOARD.INTRODUCTION.BLOCKS')

    this.subscriptions.add(
      this.translateService.onLangChange.subscribe((newLang) => {
        this.displayLang = newLang.lang
        this.blocks = this.translateService?.instant('DASHBOARD.INTRODUCTION.BLOCKS')
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  fetchContentCards(): void {
    this.contentService.getCards().subscribe((data) => {
      this.cards = data
    })
  }

  openCardUrl(cardUrl: string): void {
    window.open(cardUrl)
  }

  getCurrentLang(): void {
    this.displayLang = this.translateService.currentLang as 'en' | 'de'
  }
}
