---
title: Add hooks to your plan
---

# Add hooks to your plan
Now that you have copied over the correct files into the correct build-time location, you must copy them over into the correct location used at runtime and start the `npm` binary. To do that, we are going to use hooks, which are scripts that respond to specific events during the lifecycle of a running service.

The `init` and `run` hooks are responsible for defining behavior during initialization and when the child service/application starts up. We use these hooks to ensure our Node.js application runs correctly.

Perform the following operations in the same directory where the `plan.sh` file is located.

  > Note: These steps can also be done outside of the studio environment.

1. Inside the studio, change directory to `/src` and make a new sub-directory called hooks.

       [4][default:/src:0]# cd /src
       [5][default:/src:0]# mkdir -p hooks

2. Change to the hooks directory and create two new files, init and run.

       [6][default:/src:0]# cd hooks
       [7][default:/src/hooks:0]# touch init run

3. Open `init` in your text editor.
4. Hooks use [shebangs](https://en.wikipedia.org/wiki/Shebang_(Unix)) to decide which interpreter to use when running their scripts. In the case of the `init` and `run` hooks in our plan, we will use the system shell, so add the following to the `init` hook file:

       #!/bin/sh
       #
       ln -sf {{pkg.path}}/package.json {{pkg.svc_var_path}}
       ln -sf {{pkg.path}}/server.js {{pkg.svc_var_path}}
       ln -sf {{pkg.path}}/node_modules {{pkg.svc_var_path}}

    This will symlink the files from the location where the package is installed to the directory used when the service starts.

5. Save the `init` file and open the `run` hook file.
6. The `run` hook is where we are actually going to start our Node.js application, so add the shebang, change to the service directory to make sure the `npm` binary starts in it, and then run `npm start`.

       #!/bin/sh
       #
       cd {{pkg.svc_var_path}}

       # `exec` makes it so the process that the Habitat supervisor uses is
       # `npm start`, rather than the run hook itself. `2>&1` makes it so both
       # standard output and standard error go to the standard output stream,
       # so all the logs from the application go to the same place.
       exec npm start 2>&1

7. Save the `run` hook file.

This application would almost work except the `config.json` file that was originally part of the source files was not copied over in our plan. This was on purpose. In the next step, you'll learn how to create a templatized version of a configuration file for your application that you can use to modify the configuration settings at runtime.

<hr>
<ul class="main-content--button-nav">
  <li><a href="/tutorials/getting-started-configure-plan" class="button cta">Next - Add configuration to your plan</a></li>
  <li><a href="/tutorials/getting-started-create-plan/">Back to previous step</a></li>
</ul>
