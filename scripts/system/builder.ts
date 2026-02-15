import { BuilderInterface } from './interface/builder.interface';
import { isValidNameNpmPackage } from '../../utils/validNameNpmPackage';
import { isComponentExists } from '../../utils/componentExists';
import { defaultBuilder } from './default.builder';

export class Builder implements BuilderInterface {
  update: boolean;
  description?: string;
  prefix?: string;

  constructor(update: boolean, description?: string, prefix?: string) {
    this.update = update;
    this.description = description || '';
    this.prefix = prefix || '';

    const packagePrefix: string = this.prefix.length > 0 ? `@${this.prefix}/` : '';
    const packageDescription: string = this.description.length > 0 ? `${this.description}` : '';
    const packageUpdate: boolean = this.update;
    let packageType: string;

    switch (process.env.npm_lifecycle_event) {
      case 'library:new':
        packageType = 'libraries';
        break;
      case 'playground:new':
        packageType = 'playgrounds';
        break;
      default:
        packageType = 'libraries';
    }

    const argv = process.argv;
    let packagesFolder: string = `${__dirname.substring(
      0,
      __dirname.lastIndexOf('scripts'),
    )}${packageType}/`;
    const newPackageName: string = argv[2] as string;
    const newPackagePath: string = packagesFolder + newPackageName;

    isValidNameNpmPackage(newPackageName);
    isComponentExists(newPackagePath);

    defaultBuilder(
      newPackageName,
      packageDescription,
      packagePrefix,
      packageType,
      newPackagePath,
      packageUpdate,
    );
  }
}
