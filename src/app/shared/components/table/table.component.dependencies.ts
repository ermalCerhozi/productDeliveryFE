import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslocoDirective } from "@jsverse/transloco";

export const TABLE_DEPENDENCIES = [MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatTooltipModule, MatCheckboxModule, MatMenuModule, TranslocoDirective];