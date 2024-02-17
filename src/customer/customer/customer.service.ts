import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerService {
    
    getName() {
        return {
            name: "Mohamed Taha",
        }
    }
}
