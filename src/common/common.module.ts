import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RolesGuard } from './guards/roles.guard';
import { StoreAccessGuard } from './guards/store-access.guard';

@Global()
@Module({
  providers: [AuditService, RolesGuard, StoreAccessGuard],
  exports: [AuditService, RolesGuard, StoreAccessGuard],
})
export class CommonModule {}
