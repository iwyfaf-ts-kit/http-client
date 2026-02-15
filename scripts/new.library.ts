import { Builder } from './system/builder';
import inquirer from 'inquirer';

{
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'prefix',
        message: 'Enter package prefix if it exists',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter package description if it exists',
      },
      {
        type: 'confirm',
        name: 'update',
        message: 'Update lib dependencies?',
      },
    ])
    .then((answers) => {
      new Builder(answers.update, answers.description, answers.prefix);
    });
}
