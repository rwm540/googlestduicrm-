import { Ticket, Customer, SupportContract, CustomerLevel, SupportContractLevel, TicketPriority } from '../types';
import { getCalculatedStatus } from './dateFormatter';

const customerLevelWeights: Record<CustomerLevel, number> = {
  'A': 1,
  'B': 2,
  'C': 3,
  'D': 4,
};

const supportContractLevelWeights: Record<SupportContractLevel, number> = {
  'طلایی': 1,
  'نقره ای': 2,
  'برنزه': 3,
};

const ticketPriorityWeights: Record<TicketPriority, number> = {
  'ضطراری': 1,
  'متوسط': 2,
  'کم': 3,
};

const DEFAULT_CUSTOMER_WEIGHT = 4;
const DEFAULT_CONTRACT_WEIGHT = 4; // Higher (less important) than any existing contract level
const DEFAULT_PRIORITY_WEIGHT = 3;

export const calculateTicketScore = (
  ticket: Ticket,
  customers: Customer[],
  supportContracts: SupportContract[]
): number => {
  const customer = customers.find(c => c.id === ticket.customerId);

  // 1. Get Customer Weight
  const customerWeight = customer ? customerLevelWeights[customer.level] ?? DEFAULT_CUSTOMER_WEIGHT : DEFAULT_CUSTOMER_WEIGHT;

  // 2. Get Support Contract Weight
  let contractWeight = DEFAULT_CONTRACT_WEIGHT;
  if (customer) {
    const activeContracts = supportContracts
      .filter(sc => sc.customerId === customer.id && getCalculatedStatus(sc.endDate, sc.status) === 'فعال');

    if (activeContracts.length > 0) {
      // Find the best active contract (lowest weight)
      contractWeight = Math.min(
        ...activeContracts.map(sc => supportContractLevelWeights[sc.level] ?? DEFAULT_CONTRACT_WEIGHT)
      );
    }
  }

  // 3. Get Ticket Priority Weight
  const priorityWeight = ticketPriorityWeights[ticket.priority] ?? DEFAULT_PRIORITY_WEIGHT;

  // 4. Calculate final score
  return customerWeight * contractWeight * priorityWeight;
};
