import {
  LifeCycleObserver
} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Role} from '../models';
import {RoleRepository} from '../repositories';
export const ADMIN_ROLE_KEY = "61080aca447fd72c780110cf";
export const USER_ROLE_KEY = "61080aca447fd72c780110d0";

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */


// @lifeCycleObserver('init')
export class RoleObserver implements LifeCycleObserver {

  constructor(
    @repository(RoleRepository) private roleRepos: RoleRepository,
  ) { }


  /**
   * This method will be invoked when the application initializes. It will be
   * called at most once for a given application instance.
   */
  async init(): Promise<void> {
    // Add your logic for init
  }

  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    // Add your logic for start
    const count = (await this.roleRepos.count()).count;
    if (count !== 0) return;

    console.log("Start database seeding");
    const roleList = [
      new Role({
        key: ADMIN_ROLE_KEY,
        description: "Admin access ",
        name: "ADMIN"
      }),
      new Role({
        key: USER_ROLE_KEY,
        description: "User access",
        name: "USER"
      }),
    ]

    await Promise.all(roleList.map(async (r) => {
      await this.roleRepos.create(r);
    }))
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}
