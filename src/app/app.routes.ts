import { Routes } from '@angular/router';
import { AddTaskComponent } from './add-task/add-task.component';
import { authGuard } from './auth.guard';
import { BoardComponent } from './board/board.component';
import { ContactsComponent } from './contacts/contacts.component';
import { HelpComponent } from './help/help.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { SuccessComponent } from './success/success.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signUp', component: SignupComponent },
  { path: 'success', component: SuccessComponent, canActivate: [authGuard] },
  { path: 'addTask', component: AddTaskComponent, canActivate: [authGuard] },
  { path: 'board', component: BoardComponent, canActivate: [authGuard] },
  { path: 'contacts', component: ContactsComponent, canActivate: [authGuard] },
  { path: 'help', component: HelpComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
