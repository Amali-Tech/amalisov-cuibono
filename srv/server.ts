import { Container } from 'typedi';

import cds from '@sap/cds';
import { useContainer } from 'cds-routing-handlers';
import "reflect-metadata";

// enable dependency injection
useContainer(Container);

module.exports = cds.server;
