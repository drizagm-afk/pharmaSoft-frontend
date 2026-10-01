import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaForm } from './categoria-form';

describe('CategoriaForm', () => {
  let component: CategoriaForm;
  let fixture: ComponentFixture<CategoriaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
