export enum OrderStatusEnum {

  /** order not firm **/
  /** if draft order is not firm, it will be deleted after 30 days **/
  DRAFT = "DRAFT",

  /** order firm and process those products **/
  PROCESSING = "PROCESSING",

  /** order firm and cancelled by client **/
  /** cancelled order will be returned to warehouse and record inactiveAt **/
  /** update stock quantity **/
  CANCELLED = "CANCELLED",

  /** order firm and shipped */
  DELIVERED = "DELIVERED",

  /** order firm and returned by client **/
  RETURNED = "RETURNED",

  /** order is completed, and no more action, system will be updated automatically **/
  COMPLETED = "COMPLETED",
}