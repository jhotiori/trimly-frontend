import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { SidebarComponent } from "./sidebar.component";

describe("SidebarComponent", () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SidebarComponent],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should toggle the collapsed state", () => {
        expect(component.collapsed()).toBeFalse();

        component.toggle();

        expect(component.collapsed()).toBeTrue();
    });
});
