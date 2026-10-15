import { DataSource } from 'typeorm';
import { ClinicalScaleEvaluation } from '../../domain/encounters';
import { OlderAdult } from '../../domain/virtual-records';
import { CareProgram, CareSubProgram, ResidentProgramEnrollment } from '../../domain/care-planning';

const repositoryProvider = (token: string, entity: Function) => ({
  provide: token,
  useFactory: (dataSource: DataSource) => dataSource.getRepository(entity),
  inject: ['DataSource'],
});

export const carePlanningProviders = [
  repositoryProvider('CareProgramRepository', CareProgram),
  repositoryProvider('CareSubProgramRepository', CareSubProgram),
  repositoryProvider('ResidentProgramEnrollmentRepository', ResidentProgramEnrollment),
  repositoryProvider('ClinicalScaleEvaluationRepository', ClinicalScaleEvaluation),
  repositoryProvider('OlderAdultRepository', OlderAdult),
];
