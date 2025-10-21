import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { User } from '../../shared/types/index.js';
import chalk from 'chalk';

export class ImportCommand implements Command {
  public getName(): string {
    return '--import';
  }

  public users: User[] = [
    { firstname: 'Ivan', email: 'ivan@mail.com', password: '123456', type: 'pro', avatarPath: 'ivanAva.jpg' },
    { firstname: 'Dima', email: 'dima@mail.com', password: '123456', type: 'standard', avatarPath: 'dimaAva.jpg' }
  ];

  public async execute(...parameters: string[]): Promise<void> {
    const [filename] = parameters;
    const fileReader = new TSVFileReader(filename.trim());

    try {
      fileReader.read();
      const colors = [chalk.green, chalk.yellow, chalk.blue, chalk.magenta];
      fileReader.toArray(this.users).forEach((offer, index) => {
        const color = colors[index % colors.length];
        console.log(color(JSON.stringify(offer, null, 2)));
      });
      console.log(chalk.magenta(fileReader.toArray(this.users).toString));
    } catch (err) {

      if (!(err instanceof Error)) {
        throw err;
      }

      console.error(`Can't import data from file: ${filename}`);
      console.error(`Details: ${err.message}`);
    }
  }
}
