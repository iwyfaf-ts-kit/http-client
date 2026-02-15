# TS Library Builder
Builder for developing TypeScript libraries.

## Содержание
- [Install](#install)
- [Create library](#create-library)
- [Create playground](#create-playground)
  - [Test libraries](#test-libraries)

## Install
You can click "Use this template" button or clone:

```
git clone git@github.com:iwyfaf-js-templates/ts-library-builder.git library-name
```

[[↑] Back to top](#содержание)

## Create library
To create a new library just do:

```
npm run library:new library-name
```

And follow the suggested steps. 

After that, create a `src` folder inside the library and start building your project.

[[↑] Back to top](#содержание)

## Create playground
To create a new playground just do:

```
npm run playground:new playground-name
```

And follow the suggested steps.

[[↑] Back to top](#содержание)

### Test libraries
To test your libraries, in the Playground app find `package.json` file and add the dependency:

```
"dependencies": {
  "@your-prefix/component-name": "file:../../libraries/component-name"
},
```

Then in the Playground app run:

```
npm i
```

Now you can test your libraries as if you installed them from NPM.
