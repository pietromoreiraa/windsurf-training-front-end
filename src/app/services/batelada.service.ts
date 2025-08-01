import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BigBag {
  numberOfBatch: number;
  question1?: boolean;
  question2?: boolean;
  question3?: boolean;
  question4?: boolean;
  question5?: boolean;
}

export interface Batch {
  id?: number; // Optional for new records
  batchNumber: number;
  createdByUserId: number;
  isFinalized?: boolean;
  bigbags: BigBag[];
}

@Injectable({
  providedIn: 'root'
})
export class BateladaService { //essas funções aqui dentro (de um objeto) são chamadas de metodos

  // TODO: Substitua pela URL real da sua API
  private apiUrl = 'http://localhost:3000/batch';

  constructor(private http: HttpClient) { }

  /**
   * Busca a lista de bateladas do back-end.
   */
  getBateladas(): Observable<Batch[]> {
    return this.http.get<Batch[]>(this.apiUrl);
  }

  /**
   * Cria um novo lote (batch)
   * @param batch Dados do lote a ser criado
   */
  createBatch(batch: Omit<Batch, 'id'>): Observable<Batch> {
    return this.http.post<Batch>(this.apiUrl, batch);
  }

  /**
   * Busca um lote pelo ID
   * @param id ID do lote
   */
  getBatchById(id: number): Observable<Batch> {
    return this.http.get<Batch>(`${this.apiUrl}/${id}`);
  }

  /**
   * Atualiza um lote existente
   * @param id ID do lote
   * @param batch Dados atualizados do lote
   */
  updateBatch(id: number, batch: Partial<Batch>): Observable<Batch> {
    return this.http.put<Batch>(`${this.apiUrl}/${id}`, batch);
  }

  /**
   * Remove um lote
   * @param id ID do lote a ser removido
   */
  deleteBatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}