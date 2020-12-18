import { HttpClient } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { AppConfigService } from 'src/app/config/app-config.service'
import { IArchetypeQueryBuilderResponse } from 'src/app/shared/models/archetype-query-builder/archetype-query-builder.response.interface'
import { mockAqbTemplates } from 'src/mocks/data-mocks/aqb/aqb-templates.mock'
import { mockComplexContains } from 'src/mocks/data-mocks/aqb/complex-contains.mock'
import { mockCoronaAnamnese } from 'src/mocks/data-mocks/aqb/corona-anamnese.mock'
import { AqlEditorService } from './aql-editor.service'

describe('AqlEditorService', () => {
  let service: AqlEditorService
  const baseUrl = 'localhost/aqleditor/rest/v1'

  const httpClient = ({
    get: () => jest.fn(),
    post: () => jest.fn(),
  } as unknown) as HttpClient

  const appConfig = {
    config: {
      aqlEditor: {
        baseUrl: 'localhost/aqleditor',
      },
    },
  } as AppConfigService

  beforeEach(() => {
    service = new AqlEditorService(httpClient, appConfig)
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('When a call to getTemplates method comes in', () => {
    it('should call the api - with success', () => {
      jest.spyOn(httpClient, 'get').mockImplementation(() => of(mockAqbTemplates))
      service.getTemplates().subscribe()
      expect(httpClient.get).toHaveBeenCalledWith(`${baseUrl}/template`)
    })

    it('should call the api - with error', () => {
      jest.spyOn(httpClient, 'get').mockImplementation(() => throwError('Error'))
      jest.spyOn(service, 'handleError')
      service.getTemplates().subscribe()
      expect(httpClient.get).toHaveBeenCalledWith(`${baseUrl}/template`)
      expect(service.handleError).toHaveBeenCalled()
    })

    it('should expose the templates on the templates observable', (done) => {
      jest.spyOn(httpClient, 'get').mockImplementation(() => of(mockAqbTemplates))

      service.getTemplates().subscribe()

      service.templatesObservable$.subscribe((templates) => {
        expect(templates).toEqual(mockAqbTemplates)
        expect(httpClient.get).toHaveBeenCalledWith(`${baseUrl}/template`)
        done()
      })
    })
  })

  describe('When the content of a template is supposed to be fetched by getContainment method', () => {
    it('should call the api, if no cachedContainment is found', () => {
      const id = 'test1'
      jest.spyOn(httpClient, 'get').mockImplementation(() => of(mockCoronaAnamnese))
      service.getContainment(id).subscribe()
      expect(httpClient.get).toHaveBeenCalledWith(`${baseUrl}/containment/${id}`)
    })

    it('should not call the api, if a cachedContainment is found', () => {
      const id = 'test1'
      jest.spyOn(httpClient, 'get').mockImplementation(() => of(mockCoronaAnamnese))

      // Cache prefill:
      service.getContainment(id).subscribe()
      expect(httpClient.get).toHaveBeenCalledWith(`${baseUrl}/containment/${id}`)
      expect(httpClient.get).toHaveBeenCalledTimes(1)

      // Actual assertion:
      service.getContainment(id).subscribe()
      expect(httpClient.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('When a query is supposed to be build by the aql-editor backend', () => {
    it('should post the aqb model to the api', () => {
      const buildResponse: IArchetypeQueryBuilderResponse = {
        q: 'result string',
        parameters: {},
      }
      jest.spyOn(httpClient, 'post').mockImplementation(() => of(buildResponse))
      service.buildAql(mockComplexContains)
      expect(httpClient.post).toHaveBeenCalledWith(`${baseUrl}/aql`, mockComplexContains)
    })
  })
})
