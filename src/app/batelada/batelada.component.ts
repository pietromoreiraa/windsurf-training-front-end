import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { BateladaService, Batch, BigBag } from '../services/batelada.service';

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
  isEditMode = false;
  currentBatchId: number | null = null;
  questions: string[] = [
    'Pergunta 1',
    'Pergunta 2',
    'Pergunta 3',
    'Pergunta 4',
    'Pergunta 5',
  ];
  bateladas: string[] = ['BigBag 1', 'BigBag 2', 'BigBag 3'];
  displayedColumns: string[] = [];

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute,
    private bateladaService: BateladaService,
    private snackBar: MatSnackBar
  ) {}

    goBack(): void {
    this.router.navigate(['/welcome']);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.updateDisplayedColumns();
    this.checkEditMode();
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.currentBatchId = +id;
        this.loadBatchData(this.currentBatchId);
      }
    });
  }

  private loadBatchData(id: number): void {
    this.loading = true;
    this.bateladaService.getBatchById(id).subscribe({
      next: (batch: Batch) => {
        console.log('Dados recebidos da API:', batch);
        console.log('BigBags recebidos:', batch.bigbags);
        this.populateFormWithBatchData(batch);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados da batelada:', error);
        this.error = 'Erro ao carregar dados da batelada';
        this.snackBar.open(this.error, 'Fechar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  private populateFormWithBatchData(batch: Batch): void {
    console.log('Carregando dados da batelada:', batch);
    
    // Atualizar a lista de bigbags baseada nos dados carregados
    this.bateladas = batch.bigbags.map((_, index) => `BigBag ${index + 1}`);
    this.updateDisplayedColumns();

    // Recriar o formulário com o número correto de bigbags
    this.initializeForm();
    
    // Preencher o número da batelada
    this.checklistForm.patchValue({
      bateladaNumber: batch.batchNumber
    });

    // Aguardar um tick para garantir que o formulário foi criado
    setTimeout(() => {
      // Preencher as respostas individualmente
      batch.bigbags.forEach((bigbag, bigbagIndex) => {
        console.log(`Processando BigBag ${bigbagIndex + 1}:`, bigbag);
        
        this.questions.forEach((_, questionIndex) => {
          const questionKey = `question${questionIndex + 1}` as keyof BigBag;
          const answer = bigbag[questionKey];
          
          console.log(`Questão ${questionIndex + 1}, BigBag ${bigbagIndex + 1}:`, answer);
          
          if (answer !== undefined && answer !== null) {
            try {
              const formArray = this.getQuestionAnswers(questionIndex);
              if (formArray && formArray.at(bigbagIndex)) {
                // Converter valor numérico para booleano se necessário
                const booleanValue = answer === 1 || answer === true;
                formArray.at(bigbagIndex).setValue(booleanValue);
                console.log(`✓ Valor definido: ${booleanValue} (convertido de ${answer}) para questão ${questionIndex + 1}, BigBag ${bigbagIndex + 1}`);
              } else {
                console.error(`✗ FormArray não encontrado para questão ${questionIndex + 1}, BigBag ${bigbagIndex + 1}`);
              }
            } catch (error) {
              console.error(`Erro ao definir valor para questão ${questionIndex + 1}, BigBag ${bigbagIndex + 1}:`, error);
            }
          } else {
            console.log(`Valor undefined/null para questão ${questionIndex + 1}, BigBag ${bigbagIndex + 1}`);
          }
        });
      });
      
      console.log('Formulário final:', this.checklistForm.value);
    }, 100);
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
    
    const batchData = this.prepareBatchData();
    
    if (this.isEditMode && this.currentBatchId) {
      // Modo de edição - atualizar batelada existente
      this.bateladaService.updateBatch(this.currentBatchId, batchData).subscribe({
        next: () => {
          this.snackBar.open('Rascunho atualizado com sucesso!', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao atualizar rascunho:', error);
          this.error = 'Erro ao atualizar o rascunho';
          this.snackBar.open(this.error, 'Fechar', { duration: 5000 });
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      // Modo de criação - criar nova batelada
      this.bateladaService.createBatch(batchData).subscribe({
        next: () => {
          this.snackBar.open('Rascunho salvo com sucesso!', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao salvar rascunho:', error);
          this.error = 'Erro ao salvar o rascunho';
          this.snackBar.open(this.error, 'Fechar', { duration: 5000 });
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  onSaveAndFinalize(): void {
    this.setAnswerValidators(true);

    if (this.checklistForm.valid) {
      this.loading = true;
      
      const batchData = this.prepareBatchData();
      
      if (this.isEditMode && this.currentBatchId) {
        // Modo de edição - atualizar batelada existente
        this.bateladaService.updateBatch(this.currentBatchId, batchData).subscribe({
          next: () => {
            this.snackBar.open('Batelada atualizada e finalizada com sucesso!', 'Fechar', { duration: 3000 });
            this.router.navigate(['/batelada-list']);
          },
          error: (error) => {
            console.error('Erro ao finalizar batelada:', error);
            this.error = 'Erro ao finalizar a batelada';
            this.snackBar.open(this.error, 'Fechar', { duration: 5000 });
          },
          complete: () => {
            this.loading = false;
          }
        });
      } else {
        // Modo de criação - criar nova batelada
        this.bateladaService.createBatch(batchData).subscribe({
          next: () => {
            this.snackBar.open('Batelada finalizada com sucesso!', 'Fechar', { duration: 3000 });
            this.router.navigate(['/batelada-list']);
          },
          error: (error) => {
            console.error('Erro ao finalizar batelada:', error);
            this.error = 'Erro ao finalizar a batelada';
            this.snackBar.open(this.error, 'Fechar', { duration: 5000 });
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    } else {
      this.error = 'Todos os campos são obrigatórios para finalizar.';
      this.snackBar.open(this.error, 'Fechar', { duration: 5000 });
    }
    
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

  private prepareBatchData(): Omit<Batch, 'id'> {
    const formValue = this.checklistForm.value;
    const bigbags: BigBag[] = [];
    
    // Process each bigbag column
    for (let i = 0; i < this.bateladas.length; i++) {
      const bigbag: BigBag = {
        numberOfBatch: i + 1
      };
      
      // Process each question for this bigbag
      this.questions.forEach((_, qIndex) => {
        const answer = this.getQuestionAnswers(qIndex).at(i)?.value;
        if (answer !== null && answer !== undefined) {
          // Use type assertion to bypass TypeScript's strict checking
          (bigbag as any)[`question${qIndex + 1}`] = answer;
        }
      });
      
      bigbags.push(bigbag);
    }
    
    return {
      batchNumber: Number(formValue.bateladaNumber),
      createdByUserId: 1, // TODO: Replace with actual user ID from auth service
      bigbags
    };
  }
}
