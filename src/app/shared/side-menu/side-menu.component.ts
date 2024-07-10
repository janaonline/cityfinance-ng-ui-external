import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

export interface ILink {
  title: string;
  type: "link" | "other";
  route?: string[];
  condition?: Function;
  subMenus?: ILink[];
}

interface IMenus {
  title: string;
  subMenus: ILink[];
}

@Component({
  selector: "app-side-menu",
  templateUrl: "./side-menu.component.html",
  styleUrls: ["./side-menu.component.scss"],
})
export class SideMenuComponent implements OnInit, OnChanges {
  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    const menus = this.filterOutContents(changes.contents.currentValue);
    this.contents = menus;
    console.log('contents', this.contents);
  }

  @Input("content") contents: IMenus[] = [];

  ngOnInit() {}

  filterOutContents(list: IMenus[]) {
    if (!list.length) return list;
    return list
      .map((menu) => {
        const old = { ...menu };
        old.subMenus = this.filterInaccesssibleMenus([...menu.subMenus]);
        return old;
      })
      .filter((data) => data.subMenus.length);
  }

  filterInaccesssibleMenus(list: ILink[]) {
    if (!list) return list;
    return list.filter((link) => {
      if (link.type === "link") {
        return link.condition ? link.condition() : true;
      }

      return this.filterInaccesssibleMenus(link.subMenus);
    });
  }
}
