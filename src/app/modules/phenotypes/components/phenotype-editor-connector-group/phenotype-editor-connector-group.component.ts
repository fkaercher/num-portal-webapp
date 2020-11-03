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

@Component({
  selector: 'num-phenotype-editor-connector-group',
  templateUrl: './phenotype-editor-connector-group.component.html',
  styleUrls: ['./phenotype-editor-connector-group.component.scss'],
})
export class PhenotypeEditorConnectorGroupComponent implements OnInit, OnChanges {
  readonly phenotypeQueryType = PhenotypeQueryType
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

  constructor() {}

  ngOnInit(): void {
    this.groupType = !this.selfGroupIndex ? 'MAIN_GROUP' : 'SUB_GROUP'
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
    // Open Modal
    console.log('addQuery')
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
