/**
 * Copyright 2021 Vitagroup AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core'
import moment from 'moment'

@Injectable({
  providedIn: 'root',
})
export class DateHelperService {
  constructor() {}
  static getDateString(date: moment.Moment): string {
    if (!date.isValid) {
      date = moment(date)
    }
    const d = date.toDate()
    const year = d.getFullYear()
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
  }
  //we switched from javascript Date to Momentjs (https://momentjs.com/). If we need to support timebased funtions the cide below needs to be changed, too
  static getTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return `${hours}:${minutes}:${seconds}`
  }

  static getOffsetString(date: Date): string {
    const offset = date.getTimezoneOffset()
    const sign = offset > 0 ? '-' : '+'
    const hours = Math.abs(Math.trunc(offset / 60))
      .toString()
      .padStart(2, '0')
    const minutes = (offset % 60).toString().padStart(2, '0')

    return `${sign}${hours}${minutes}`
  }

  static getIsoString(date: Date): string {
    const dateString = this.getDateString(moment(date))
    const timeString = this.getTimeString(date)
    const offset = this.getOffsetString(date)

    return `${dateString}T${timeString}${offset}`
  }
}
