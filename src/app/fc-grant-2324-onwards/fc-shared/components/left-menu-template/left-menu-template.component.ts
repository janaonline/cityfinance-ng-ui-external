import { KeyValue } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserUtility } from 'src/app/util/user/user';

@Component({
  selector: 'app-left-menu-template',
  templateUrl: './left-menu-template.component.html',
  styleUrls: ['./left-menu-template.component.scss']
})
export class LeftMenuTemplateComponent implements OnInit, OnChanges {
  role: string;
  constructor() {
    this.role = new UserUtility().getLoggedInUserDetails().role;
  }
  @Input() leftMenu = {};
  @Input() isLeftMenu = false;
  @Input() selectedYear="";
  ngOnInit(): void {

  }
  // ngOnChanges(changes: SimpleChanges){
  // if(changes?.leftMenu && changes?.leftMenu?.currentValue;)
  //   this.leftMenu = changes.leftMenu.currentValue;
  // }

  returnPostion = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    let val_1: any = a;
    let val_2: any = b;
    val_1 = (val_1.key?.split('_'))[1];
    val_2 = (val_2.key?.split('_'))[1];
    return val_1 > val_2 ? 1 : (val_2 > val_1 ? -1 : 0);
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes?.isLeftMenu){
      this.isLeftMenu = changes?.isLeftMenu?.currentValue
    }

  }

}
