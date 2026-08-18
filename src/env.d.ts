/// <reference types="astro/client" />
import type { Session } from './lib/auth';

declare global {
  namespace App {
    interface Locals {
      user?: Session;
    }
  }
}
export {};
