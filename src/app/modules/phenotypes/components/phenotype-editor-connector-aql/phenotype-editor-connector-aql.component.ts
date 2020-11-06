import { Component, Input, OnInit } from '@angular/core'
import { AqlUiModel } from 'src/app/shared/models/aql/aql-ui.model'
import { IPhenotypeQuery } from '../../../../shared/models/phenotype/phenotype-query.interface'

@Component({
  selector: 'num-phenotype-editor-connector-aql',
  templateUrl: './phenotype-editor-connector-aql.component.html',
  styleUrls: ['./phenotype-editor-connector-aql.component.scss'],
})
export class PhenotypeEditorConnectorAqlComponent implements OnInit {
  @Input() phenotypeAql: AqlUiModel
  constructor() {}

  ngOnInit(): void {}
}
