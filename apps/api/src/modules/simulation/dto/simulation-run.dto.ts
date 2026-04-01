import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class CreateSimulationRunDto {
  /**
   * The simulation to run. Provided in the request body when not derivable
   * from the route param.
   */
  @IsUUID()
  @IsOptional()
  simulationId?: string;

  /**
   * User requesting the run. Defaults to the authenticated user's ID.
   */
  @IsUUID()
  @IsOptional()
  requestedById?: string;
}

export class UpdateSimulationRunDto {
  /**
   * New status — only CANCELLED is accepted via the API.
   * RUNNING/COMPLETED/FAILED are set internally by the worker.
   */
  @IsIn(['CANCELLED'])
  status!: 'CANCELLED';
}
