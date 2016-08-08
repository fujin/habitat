// Copyright (c) 2016 Chef Software Inc. and/or applicable contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Component, Input, OnInit} from "angular2/core";
import {CheckingInputComponent} from "../CheckingInputComponent";
import {ControlGroup, FormBuilder, Validators} from "angular2/common";
import {GitHubApiClient} from "../GitHubApiClient";
import {AppStore} from "../AppStore";
import {addProject} from "../actions/index";
import {RouterLink} from "angular2/router";

@Component({
    selector: "hab-project-info",
    directives: [CheckingInputComponent, RouterLink],
    template: `
    <form [ngFormModel]="form" (ngSubmit)="addProject(form.value)" #formValues="ngForm">
      <div class="scm-repo-fields">
          <label>GitHub Repository</label>
          <div *ngIf="repo">
              <a href="https://github.com/{{ownerAndRepo}}" target="_blank">
                  {{ownerAndRepo}}
              </a>
              <a [routerLink]='["SCMRepos"]' href="#">(change)</a>
          </div>
          <div *ngIf="!repo">
              <a [routerLink]='["SCMRepos"]' href="#">
                  (select a GitHub repository)
              </a>
          </div>
      </div>
      <div class="project-fields">
          <div class="origin">
              <label for="origin">Project Origin</label>
              <select ngControl="origin"
                      id="origin">
                  <option></option>
                  <option *ngFor="#origin of myOrigins">
                      {{origin.name}}
                  </option>
              </select>
          </div>
          <div class="plan">
              <label for="plan">Path to Plan file</label>
              <small>The location in the repository of the plan.sh that will build this project.</small>
              <hab-checking-input availableMessage="exists"
                                  displayName="File"
                                  [form]="form"
                                  id="plan"
                                  [isAvailable]="doesFileExist"
                                  [maxLength]="false"
                                  name="plan_path"
                                  notAvailableMessage="does not exist in repository"
                                  [pattern]="false"
                                  [value]="planPath">
              </hab-checking-input>
          </div>
            <div class="submit">
                <button type="submi" [disabled]="!form.valid">
                    Save Project
                </button>
            </div>
        </div>
    </form>
    `
})

export class ProjectInfoComponent implements OnInit {
    private form: ControlGroup;
    private doesFileExist: Function;

    @Input() project: Object;
    @Input() ownerAndRepo: String;

    constructor(private formBuilder: FormBuilder, private store: AppStore) {}

    get myOrigins() {
        return this.store.getState().origins.mine;
    }

    get repoOwner() {
        return (this.ownerAndRepo || "").split("/")[0];
    }

    get repo() {
        return (this.ownerAndRepo || "").split("/")[1];
    }

    get token() {
        return this.store.getState().gitHub.authToken;
    }

    get planPath() {
        if (this.project) {
            return this.project["plan_path"];
        } else {
            return "plan.sh";
        }
    }

    private addProject(values) {
        // Change the format to match what the server wants
        values.github = {
            organization: this.repoOwner,
            repo: this.repo
        };
        delete values.repo;

        let redirectRoute;
        let currentPackage = this.store.getState().packages.current;

        if (currentPackage === undefined) {
            redirectRoute = ["Projects"];
        } else {
            redirectRoute = ["Package", {
                origin: currentPackage.ident.origin,
                name: currentPackage.ident.name,
                version: currentPackage.ident.version,
                release: currentPackage.ident.release
            }];
        }

        this.store.dispatch(addProject(values, this.token, redirectRoute));
        return false;
    }

    public ngOnInit() {
        this.form = this.formBuilder.group({
            repo: [this.repo || "", Validators.required],
            origin: [this.myOrigins.first(),
                Validators.required],
            plan_path: ["plan.sh", Validators.required],
        });

        this.doesFileExist = function (path) {
            return new GitHubApiClient(
                this.store.getState().gitHub.authToken
            ).doesFileExist(this.repoOwner, this.repo, path);
        }.bind(this);

        // Wait a second to set the fields as dirty to do validation on page
        // load. Doing this later in the lifecycle causes a changed after it was
        // checked error.
        setTimeout(() => {
            this.form.controls["plan_path"].markAsDirty();
         } , 1000);
    }
}
