This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Multi-Entity Management Tool - Entity Assignment

This is an electron desktop application built for windows that allows users an interface to the Dynamics General Plains (GP) Multi-Entity Assignment function.

### Why is this necessary

The default window that ships with MEM doesn't allow users to search and specify the debtor/customer or vendor/creditor that they wish to assign an entity to.

This limitation prevents specific assignment, and the user instead has to opt for rolling down entity assignment on class.

## Deployment

This application uses react as the user interface and MSSQL to update and query the MEM database via stored procedures.

- Yarn dist will build and package the electron application
