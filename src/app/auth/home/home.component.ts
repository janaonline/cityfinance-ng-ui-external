import { Component, OnInit } from "@angular/core";
import { CarouselConfig } from "ngx-bootstrap/carousel";
import { interval } from "rxjs";
import { Router } from "@angular/router";
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common'
interface Link {
  text: string;
  link?: string;
  hoverText?: string;
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  providers: [
    {
      provide: CarouselConfig,
      useValue: {
        interval: 4000,
        noPause: true,
        showIndicators: true,
      },
    },
  ],
})
export class HomeComponent implements OnInit {
  isProduction = !(
    window.location.hostname.includes("demo") ||
    window.location.hostname.includes("staging") ||
    window.location.hostname.includes("localhost")
  );

  statistics = [
    {
      title: "",
      caption: "ULB Statistics",
      chartClass: "text-warning bg-warning",
      containerClass: "col-md-3",
      hasChart: false,
    },
    {
      title: "States Covered",
      caption: "18 / 28",
      chartClass: "text-warning bg-warning",
      containerClass: "col-md-3",
      hasChart: true,
    },
    {
      title: "No of ULBs",
      caption: "522",
      chartClass: "text-warning bg-warning",
      containerClass: "col-md-3",
      hasChart: true,
    },

    {
      title: "Credit Rated ULBs",
      caption: "93",
      chartClass: "text-warning bg-warning",
      containerClass: "col-md-3",
      hasChart: true,
    },
    {
      title: "",
      caption: "Municipal Finance Laws",
      chartClass: "text-primary bg-primary",
      containerClass: "col-md-3",
      hasChart: false,
    },
    {
      title: "States",
      caption: "28",
      chartClass: "text-primary bg-primary",
      containerClass: "col-md-3",
      hasChart: true,
    },
    {
      title: "ULB laws",
      caption: "108",
      chartClass: "text-primary bg-primary",
      containerClass: "col-md-3",
      hasChart: true,
    },
    {
      title: "Criteria",
      caption: "71",
      chartClass: "text-primary bg-primary",
      containerClass: "col-md-3",
      hasChart: true,
    },
    {
      title: "",
      caption: "Status",
      chartClass: "text-danger bg-danger",
      containerClass: "col-md-3",
      hasChart: false,
    },
    {
      title: "Financial Statements",
      caption: "900",
      chartClass: "text-danger bg-danger",
      containerClass: "col-md-3",
      hasChart: true,
    },
    {
      title: "Audit Status",
      caption: "100%",
      chartClass: "text-danger bg-danger",
      containerClass: "col-md-3",
      hasChart: true,
    },
    {
      title: "Unaudited Status",
      caption: "0%",
      chartClass: "text-danger bg-danger",
      containerClass: "col-md-3",
      hasChart: true,
    },
  ];

  importantLinks: Link[] = [
    {
      text: "Audited/Unaudited Annual Accounts of ULBs",
      link: "/financial-statement/report/basic",
    },
    {
      text: "Municipal Bonds and Pooled Debt Obligations",
      link: "/borrowings/municipal-bond",
    },
    {
      text: "Credit Rating of all ULBs to date",
      link: "/borrowings/credit-rating",
    },
    {
      text: "Database of finance related provisions",
    },
    { text: "Fiscal Ranking of ULBs" },
    { text: "Service Level Benchmarks vs Actuals" },
    { text: "List of urban PPPs" },
    { text: "Annual Accounts of key parastatals" },
    { text: "List of urban projects, including tenders and schemes" },
    { text: "E-learning modules with certification for accounting staff" },
    { text: "Compilation of CAG/DLFA audit reports" },
    { text: "Budget Briefs for top 500 cities in India" },
    { text: "Urban budgets of State Governments" },
    { text: "Index on quality of input data" },
    { text: "Best practice compilation and discussion forums" },
    { text: "Model documents/How To kits for RFPs" },
    { text: "XBRL for input of data directly by ULBs/States" },
  ];

  constructor(
    public _router: Router,
    @Inject(DOCUMENT) private _document,
    private renderer2: Renderer2,) { }

  ngOnInit() {
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';

    s.text = `   
        window.JOONBOT_WIDGET_ID = "2f16ba64-925e-46e1-96b7-f0164e68c517";
        var n, o;
        o = document.createElement("script");
        o.src = "https://js.joonbot.com/init.js", o.defer = !0, o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous";
        n = document.getElementsByTagName("script")[0], n.parentNode.insertBefore(o, n);
    

  `;
    this.renderer2.appendChild(this._document.body, s);
    setTimeout(() => {
      const aboutElement = document
        .getElementById("about-heading")
        .getBoundingClientRect();
      const quoteBox = document.getElementById("quotes-box")
        ? document.getElementById("quotes-box").getBoundingClientRect()
        : "";
      if (aboutElement == undefined || quoteBox == undefined) {
        return;
      }
      const height =
        quoteBox["top"] -
        aboutElement.bottom +
        aboutElement.height / 2 +
        quoteBox["height"];
      console.log(height);

      document.getElementById("quotes-box").style.height = `${height}px`;
    });
  }

  navigateToAnnual() {
    return this._router.navigate(["upload-annual-accounts"]);
  }
}
