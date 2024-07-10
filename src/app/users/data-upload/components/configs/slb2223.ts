import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { WaterManagement } from '../../models/financial-data.interface';

const _fb = new FormBuilder();

/**
 * @description his form is not meant to be used directly.
 * Instead use it through UploadDataUtility class.
 */
const waterWasteManagementForm: FormGroup = _fb.group({});

const targets = [
  { key: "2122", name: "Target <br> 2021-22" },
  { key: "2223", name: "Target <br> 2022-23" },
  { key: "2324", name: "Target <br> 2023-24" },
  { key: "2425", name: "Target<br> 2024-25" },
];
const score = [
  { key: "2122", name: "Scores" },
  
];

const achieved = [
    { key: "2122", name: "Achieved <br> 2021-22" },
]


const maxValidator = (control: AbstractControl) => {
  if (!control.value) return;
  const value = +control.value;
  if (value > 100) return { max: "Value cannot be greater than 100" };
  return null;
};


const services: {
  key: keyof WaterManagement;
  name: string;
  benchmark: string;
  customValidator?: (control: AbstractControl) => any;
}[] = [
    {
      key: "waterSuppliedPerDay",
      name: "Water supplied in litre per capita per day(lpcd)",
      benchmark: "135 LPCD",
    },
    {
      key: "reduction",
      name: "% of Non-revenue water",
      benchmark: "20%",
      customValidator: maxValidator,
    },
    {
      key: "houseHoldCoveredWithSewerage",
      name: "% of households covered with sewerage/septage services",
      benchmark: "100%",
      customValidator: maxValidator,
    },
    {
      key: "houseHoldCoveredPipedSupply",
      name: "% of households covered with piped water supply",
      benchmark: "100%",
      customValidator: maxValidator,
    },
  ];


 

// Dynamically create and map all the controls for earch service.
services.forEach((service) => {
  // Dynamically create controls for each target.
  const targetControls = _fb.group({});
  const achievedControls = _fb.group({});
  const scoreControls = _fb.group({});
  targets.forEach((tg) => {
    if (service.customValidator) {
      targetControls.addControl(
        tg.key,
        new FormControl("", {
          validators: [
            Validators.required,
            Validators.pattern("^\\d+\\.{0,1}\\d*$"),
            service.customValidator,
          ],
          updateOn: "blur",
        })
      );
    } else {
      targetControls.addControl(
        tg.key,
        new FormControl("", {
          validators: [
            Validators.required,
            Validators.pattern("^\\d+\\.{0,1}\\d*$"),
          ],
          updateOn: "blur",
        })
      );
    }
  });
  achieved.forEach((tg) => {
    if (service.customValidator) {
        achievedControls.addControl(
        tg.key,
        new FormControl("", {
          validators: [
            Validators.required,
            Validators.pattern("^\\d+\\.{0,1}\\d*$"),
            service.customValidator,
          ],
          updateOn: "blur",
        })
      );
    } else {
        achievedControls.addControl(
        tg.key,
        new FormControl("", {
          validators: [
            Validators.required,
            Validators.pattern("^\\d+\\.{0,1}\\d*$"),
          ],
          updateOn: "blur",
        })
      );
    }
  });
  score.forEach((tg) => {
    if (service.customValidator) {
      scoreControls.addControl(
        tg.key,
        new FormControl("", {
          validators: [
            Validators.required,
            Validators.pattern("^\\d+\\.{0,1}\\d*$"),
            service.customValidator,
          ],
          updateOn: "blur",
        })
      );
    } else {
      scoreControls.addControl(
        tg.key,
        new FormControl("", {
          validators: [
            Validators.required,
            Validators.pattern("^\\d+\\.{0,1}\\d*$"),
          ],
          updateOn: "blur",
        })
      );
    }
  });

  let baselineControl: FormGroup;
  if (service.customValidator) {
    // Create Baseline control.
    baselineControl = _fb.group({
      "2021": [
        "",
        {
          validators: [
            Validators.required,
            Validators.pattern("^\\d+\\.{0,1}\\d*$"),
            service.customValidator,
          ],
          updateOn: "blur",
        },
      ],
    });
  } else {
    // Create Baseline control.
    baselineControl = _fb.group({
      "2021": [
        "",
        {
          validators: [
            Validators.required,
            Validators.pattern("^\\d+\\.{0,1}\\d*$"),
          ],
          updateOn: "blur",
        },
      ],
    });
  }

  const serviceLevelGroup = _fb.group(
    {
      target: targetControls,
      achieved: achievedControls,
      baseline: baselineControl,
      score: scoreControls,
      status: [null],
      rejectReason: [null],
    },
    {
      validator: [Validators.required],
    }
  );

  waterWasteManagementForm.addControl(service.key, serviceLevelGroup);
});

const fileGroupArray = _fb.array([
  _fb.group({
    name: [null, [Validators.required]],
    url: [null, [Validators.required]],
    status: [null],
    rejectReason: [null],
  }),
]);



export {
  waterWasteManagementForm,
  services,
  targets,
  score,
  achieved
};
