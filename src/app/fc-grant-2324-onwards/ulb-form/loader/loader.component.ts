import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  colorSequence = ['success', 'danger', 'warning', 'info'];

  constructor() { }
  @Input() show: boolean = false;
  @Input() dots: number = 3;
  ngOnInit(): void {
  }

}
