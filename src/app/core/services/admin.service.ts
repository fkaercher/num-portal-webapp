import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import { AppConfigService } from 'src/app/config/app-config.service'
import { IOrganization } from 'src/app/shared/models/user/organization.interface'
import { IUser } from 'src/app/shared/models/user/user.interface'

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl: string

  private unapprovedUsers: IUser[] = []
  private unapprovedUsersSubject$ = new BehaviorSubject(this.unapprovedUsers)
  public unapprovedUsersObservable$ = this.unapprovedUsersSubject$.asObservable()

  private approvedUsers: IUser[] = []
  private approvedUsersSubject$ = new BehaviorSubject(this.approvedUsers)
  public approvedUsersObservable$ = this.approvedUsersSubject$.asObservable()

  constructor(private httpClient: HttpClient, appConfig: AppConfigService) {
    this.baseUrl = `${appConfig.config.api.baseUrl}/admin`
  }

  private getUsers(approved: boolean): Observable<IUser[]> {
    return this.httpClient
      .get<IUser[]>(`${this.baseUrl}/user?approved=${approved}`)
      .pipe(catchError(this.handleError))
  }

  getUnapprovedUsers(): Observable<IUser[]> {
    return this.getUsers(false).pipe(
      tap((users) => {
        this.unapprovedUsers = users
        this.unapprovedUsersSubject$.next(users)
      })
    )
  }

  getApprovedUsers(): Observable<IUser[]> {
    return this.getUsers(true).pipe(
      tap((users) => {
        this.approvedUsers = users
        this.approvedUsersSubject$.next(users)
      })
    )
  }

  addUserRoles(userId: string, role: string[]): Observable<string[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    }

    return this.httpClient
      .post<string[]>(`${this.baseUrl}/user/${userId}/role`, role, httpOptions)
      .pipe(catchError(this.handleError))
  }

  addUserOrganization(userId: string, organization: IOrganization): Observable<IOrganization> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      responseType: 'text' as 'json',
    }
    return this.httpClient
      .post<IOrganization>(`${this.baseUrl}/user/${userId}/organization`, organization, httpOptions)
      .pipe(catchError(this.handleError))
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(error)
  }
}
