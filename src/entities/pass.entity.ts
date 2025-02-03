import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class Pass {
    @PrimaryGeneratedColumn('uuid') // Auto-generated UUID
    id: string;
  
    @Column()
    password: string;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  