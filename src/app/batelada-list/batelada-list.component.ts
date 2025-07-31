import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BateladaService } from '../services/batelada.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-batelada-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './batelada-list.component.html',
  styleUrls: ['./batelada-list.component.scss']
})
export class BateladaListComponent implements OnInit {

  displayedColumns: string[] = ['id', 'nome', 'data', 'status', 'acoes'];
  bigbags: any[] = [];

  constructor(private router: Router, private bateladaService: BateladaService) { }

  ngOnInit(): void {
    this.loadBateladas();
  }

  loadBateladas(): void {
    this.bateladaService.getBateladas().subscribe({
      next: (data: any) => {
        this.bigbags = data;
        console.log('Bateladas carregadas:', this.bigbags);
      },
      error: (err: any) => {
        console.error('Erro ao carregar bateladas:', err);
        // Opcional: Adicionar uma mensagem para o usuário na tela
      }
    });
  }

  editBatelada(id: number): void {
    console.log('Editando batelada com ID:', id);
    this.router.navigate(['/batelada', id]);
  }

  deleteBatelada(id: number): void {
    console.log('Excluindo batelada com ID:', id);
    this.bigbags = this.bigbags.filter(b => b.id !== id);
  }

  goBack(): void {
    this.router.navigate(['/welcome']);
  }
}
