import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BateladaService } from '../services/batelada.service';

@Component({
  selector: 'app-batelada',
  templateUrl: './batelada.component.html',
  styleUrls: ['./batelada.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule
    
  ],
})
export class BateladaComponent implements OnInit {
  checklistForm!: FormGroup;
  loading = false;
  error: string | null = null;
  questions: string[] = [
    'Pergunta 1',
    'Pergunta 2',
    'Pergunta 3',
    'Pergunta 4',
    'Pergunta 5',
  ];
  bateladas: string[] = ['BigBag 1', 'BigBag 2', 'BigBag 3'];
  displayedColumns: string[] = [];

  constructor(private fb: FormBuilder, private router: Router, private bateladaService: BateladaService) {}

    goBack(): void {
    this.router.navigate(['/welcome']);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.updateDisplayedColumns();
  }

  private initializeForm(): void {
    const questionsControls = this.questions.map((question) => {
      const bateladaControls = this.bateladas.map((batelada) => this.fb.control(null));
      return this.fb.array(bateladaControls);
    });

    this.checklistForm = this.fb.group({
      bateladaNumber: ['', Validators.required],
      answers: this.fb.array(questionsControls),
    });
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = ['question', ...this.bateladas];
  }

  get answers(): FormArray {
    return this.checklistForm.get('answers') as FormArray;
  }

  getQuestionAnswers(questionIndex: number): FormArray {
    return this.answers.at(questionIndex) as FormArray;
  }

  get isFinalizeDisabled(): boolean {
    // Disable if batelada number is missing
    if (this.checklistForm.get('bateladaNumber')?.invalid) {
      return true;
    }
    // Disable if any radio button is unselected (null)
    return this.answers.controls.some(questionArray => 
      (questionArray as FormArray).controls.some(control => control.value === null)
    );
  }

  private setAnswerValidators(isRequired: boolean): void {
    this.answers.controls.forEach(questionArray => {
      (questionArray as FormArray).controls.forEach(control => {
        if (isRequired) {
          control.setValidators(Validators.required);
        } else {
          control.clearValidators();
        }
        control.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  onSaveDraft(): void {
    if (this.checklistForm.get('bateladaNumber')?.invalid) {
      return;
    }
    this.loading = true;
    try {
      const formData = this.checklistForm.value;
      console.log('Rascunho salvo:', formData);
      // Add draft saving logic here
    } catch (error) {
      this.error = 'Erro ao salvar o rascunho';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  onSaveAndFinalize(): void {
    this.setAnswerValidators(true);

    if (this.checklistForm.valid) {
      this.loading = true;
      try {
        const formData = this.checklistForm.value;
        console.log('Formulário finalizado:', formData);
        // Add final saving logic here
      } catch (error) {
        this.error = 'Erro ao finalizar o checklist';
        console.error(error);
      } finally {
        this.loading = false;
      }
    } else {
      this.error = 'Todos os campos são obrigatórios para finalizar.';
    }
    // It's good practice to remove the validators after the check
    this.setAnswerValidators(false);
  }

  addBatelada(): void {
    if (this.bateladas.length >= 8) {
      return;
    }
    const newBateladaName = `BigBag ${this.bateladas.length + 1}`;
    this.bateladas.push(newBateladaName);
    this.answers.controls.forEach((questionArray) => {
            (questionArray as FormArray).push(this.fb.control(null));
    });
    this.updateDisplayedColumns();
  }

  removeBatelada(index: number): void {
    if (this.bateladas.length > 1) {
      this.bateladas.splice(index, 1);
      this.answers.controls.forEach((questionArray) => {
        (questionArray as FormArray).removeAt(index);
      });
      this.updateDisplayedColumns();
    }
  }
}
