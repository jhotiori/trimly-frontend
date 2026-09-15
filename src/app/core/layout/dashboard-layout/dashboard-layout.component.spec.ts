import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { DashboardLayoutComponent } from "./dashboard-layout.component";

describe("DashboardLayoutComponent", () => {
    let component: DashboardLayoutComponent;
    let fixture: ComponentFixture<DashboardLayoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardLayoutComponent],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
