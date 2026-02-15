import { Builder } from './system/builder';
import inquirer from 'inquirer';

{
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'update',
        message: 'Update lib dependencies?',
      },
    ])
    .then((answers) => {
      new Builder(answers.update);
    });
}
