import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'
import { LogicalOperator } from 'src/app/core/models/logical-operator.enum'
import { PhenotypeQueryType } from 'src/app/core/models/phenotype-query-type.enum'
import { IPhenotypeQuery } from '../../models/phenotype-query.interface'

import debounce from 'lodash-es/debounce'
import { PhenotypeGroupType } from '../../models/phenotype-group-type.enum'
import { DialogService } from 'src/app/core/services/dialog.service'
import { DialogAddAqlsComponent } from '../dialog-add-aqls/dialog-add-aqls.component'
import { DialogSize } from 'src/app/core/models/dialog-size.enum'
import { IAql } from 'src/app/core/models/aql.interface'
import { DialogConfig } from 'src/app/core/models/dialog-config.interface'

@Component({
  selector: 'num-phenotype-editor-connector-group',
  templateUrl: './phenotype-editor-connector-group.component.html',
  styleUrls: ['./phenotype-editor-connector-group.component.scss'],
})
export class PhenotypeEditorConnectorGroupComponent implements OnInit, OnChanges {
  readonly phenotypeQueryType = PhenotypeQueryType
  readonly phenotypeGroupType = PhenotypeGroupType
  readonly logicalOperator = LogicalOperator
  readonly logicalOperatorArray = [LogicalOperator.And, LogicalOperator.Or]

  @Input() phenotypeQuery: IPhenotypeQuery
  @Input() parentGroupIndex: number[] | null
  @Input() selfGroupIndex: number | null
  @Input() index: number

  @Output() delete = new EventEmitter()

  enumerateGroupsThrottled = debounce(() => this.enumerateGroups(), 100, {
    leading: true,
    trailing: false,
  })

  groupIndex: number[]
  groupType: string

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    this.groupType = !this.selfGroupIndex ? PhenotypeGroupType.Main : PhenotypeGroupType.Sub
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'selfGroupIndex':
          case 'parentGroupIndex': {
            this.enumerateGroupsThrottled()
          }
        }
      }
    }
  }

  enumerateGroups(): void {
    this.groupIndex = [...(this.parentGroupIndex ? this.parentGroupIndex : [])]
    if (this.selfGroupIndex !== null) {
      this.groupIndex.push(this.selfGroupIndex)
    }

    let counter = 1

    this.phenotypeQuery.children.forEach((query) => {
      if (query.type === PhenotypeQueryType.Group) {
        query.indexInGroup = counter
        counter++
      }
    })
  }

  addQuery(): void {
    this.openDialog()
  }

  openDialog(): void {
    const dialogContentPayload: IAql[] = this.phenotypeQuery.children.reduce((aqls, child) => {
      if (child.type === PhenotypeQueryType.Aql) {
        aqls.push(child.aql)
      }
      return aqls
    }, [] as IAql[])

    const dialogConfig: DialogConfig = {
      dialogContentComponent: DialogAddAqlsComponent,
      title: 'ADD_AQL_DIALOG_HEADER',
      confirmButtonText: 'BUTTON.APPLY_SELECTION',
      cancelButtonText: 'BUTTON.CANCEL',
      dialogSize: DialogSize.Medium,
      dialogContentPayload,
    }

    const dialogRef = this.dialogService.openDialog(dialogConfig)

    dialogRef.afterClosed().subscribe((confirmResult: IAql[] | undefined) => {
      if (Array.isArray(confirmResult)) {
        let aqlPhenotypeQueries: IPhenotypeQuery[] = []
        const currentGroups = this.phenotypeQuery.children.filter(
          (child) => child.type === PhenotypeQueryType.Group
        )

        if (confirmResult.length) {
          aqlPhenotypeQueries = confirmResult.map((aql) => {
            return {
              isNegated: false,
              type: PhenotypeQueryType.Aql,
              aql,
            }
          })
        }
        this.phenotypeQuery.children = [...aqlPhenotypeQueries, ...currentGroups]
      }
    })
  }

  addGroup(): void {
    const group: IPhenotypeQuery = {
      isNegated: false,
      type: PhenotypeQueryType.Group,
      operator: LogicalOperator.And,
      children: [],
    }

    this.phenotypeQuery.children.push(group)
    this.enumerateGroupsThrottled()
  }

  deleteChild(index: number): void {
    this.phenotypeQuery.children.splice(index, 1)
    this.enumerateGroupsThrottled()
  }

  deleteSelf(): void {
    this.delete.emit(this.index)
  }
}
