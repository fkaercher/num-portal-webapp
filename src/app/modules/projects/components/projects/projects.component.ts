import { Component, OnInit } from '@angular/core'
import { ProjectService } from 'src/app/core/services/project/project.service'

@Component({
  selector: 'num-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  constructor(private projectService: ProjectService) {}
  ngOnInit(): void {
    this.projectService.getAll().subscribe()
  }
}
