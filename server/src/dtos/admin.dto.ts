import { IsString, Matches } from "class-validator"

export class userAdmin {
    @IsString()
    // @Length(8, 55, { message: 'to many charactrers city' })
    @Matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/, { message: 'כתובת המייל שהזנת אינה תקינה' })
    username: string

    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%?#&]{8,}$/, { message: 'הסיסמה חייבת להכיל לפחות 8 תווים, אותיות באנגלית גדולות וקטנות ואחד מהסימנים: @$!%#?&' })
    password: string
}