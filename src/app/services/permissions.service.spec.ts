import { TestBed } from '@angular/core/testing'
import { of } from 'rxjs'
import { skip, take } from 'rxjs/operators'
import { PermissionsService } from './permissions.service'
import { BakeryManagementApiService } from './bakery-management-api.service'
import {
    PermissionEntity,
    RolePermissionsSummary,
} from '../shared/models/permission.model'

describe('PermissionsService', () => {
    let service: PermissionsService
    let apiService: jasmine.SpyObj<BakeryManagementApiService>

    beforeEach(() => {
        apiService = jasmine.createSpyObj<BakeryManagementApiService>(
            'BakeryManagementApiService',
            ['getPermissions', 'createPermission', 'assignPermissionsToRole', 'getRolePermissions'],
        )

        TestBed.configureTestingModule({
            providers: [
                PermissionsService,
                { provide: BakeryManagementApiService, useValue: apiService },
            ],
        })

        service = TestBed.inject(PermissionsService)
    })

    it('should push role permissions into the stream when loading data', (done) => {
        const roles: RolePermissionsSummary[] = [
            { id: 1, name: 'Admin', permissionCodes: ['orders.create'] },
        ]
        apiService.getRolePermissions.and.returnValue(of(roles))

        service.rolePermissions$.pipe(skip(1), take(1)).subscribe((result) => {
            expect(result).toEqual(roles)
            done()
        })

        service.loadRolePermissions().subscribe()
    })

    it('should update role permissions after assigning permissions to a role', (done) => {
        const initialRoles: RolePermissionsSummary[] = [
            { id: 1, name: 'Admin', permissionCodes: ['orders.create'] },
        ]
        const serviceState = service as any
        serviceState.rolePermissionsSubject.next(initialRoles)

        const updatedPermissions: PermissionEntity[] = [
            {
                id: 10,
                code: 'orders.create',
                description: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 11,
                code: 'orders.update',
                description: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ]

        apiService.assignPermissionsToRole.and.returnValue(of(updatedPermissions))

        service.assignPermissionsToRole(1, ['orders.create', 'orders.update']).subscribe({
            next: () => {
                const value: RolePermissionsSummary[] =
                    serviceState.rolePermissionsSubject.getValue()
                expect(value[0].permissionCodes).toEqual(['orders.create', 'orders.update'])
                done()
            },
        })
    })
})
