import { NextRequest, NextResponse } from "next/server"
import { getOrder, updateOrderPayment } from "@/lib/db"
import {
  JazzCashReturnParams,
  verifyJazzCashReturn,
} from "@/lib/payment/jazzcash"
import { sendPaymentAlert, sendNewOrderAlert } from "@/lib/notify"

export const dynamic = "force-dynamic"

/**
 * JazzCash redirects the customer back here after the payment screen
 * (JAZZCASH_RETURN_URL). We re-verify the integrity hash, persist the
 * result on the order, notify WhatsApp + Gmail, then send the customer
 * to the success page.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams
  const params: JazzCashReturnParams = {
    pp_Amount: q.get("pp_Amount") ?? undefined,
    pp_AuthCode: q.get("pp_AuthCode") ?? undefined,
    pp_BankID: q.get("pp_BankID") ?? undefined,
    pp_BillReference: q.get("pp_BillReference") ?? undefined,
    pp_Description: q.get("pp_Description") ?? undefined,
    pp_Language: q.get("pp_Language") ?? undefined,
    pp_MerchantID: q.get("pp_MerchantID") ?? undefined,
    pp_ResponseCode: q.get("pp_ResponseCode") ?? undefined,
    pp_TxnCurrency: q.get("pp_TxnCurrency") ?? undefined,
    pp_TxnDateTime: q.get("pp_TxnDateTime") ?? undefined,
    pp_TxnRefNo: q.get("pp_TxnRefNo") ?? undefined,
    pp_SecureHash: q.get("pp_SecureHash") ?? undefined,
    pp_TxnType: q.get("pp_TxnType") ?? undefined,
    pp_Version: q.get("pp_Version") ?? undefined,
  }

  const billRef = params.pp_BillReference ?? q.get("order_number") ?? undefined
  const order = billRef ? getOrder(billRef) : null
  const orderNumber = order?.order_number ?? billRef ?? "unknown"

  console.log("[jazzcash/return] received for bill ref:", billRef, "response:", params.pp_ResponseCode)

  if (!order) {
    return NextResponse.redirect(
      new URL(`/checkout/success?order=${encodeURIComponent(orderNumber)}&error=notfound`, req.url)
    )
  }

  let paymentStatus = "unpaid"
  let details: string | null = null
  try {
    const result = verifyJazzCashReturn(params)
    paymentStatus = result.paymentStatus
    details = JSON.stringify({
      hashStatus: result.hashStatus,
      txnRef: result.txnRef,
      authCode: result.authCode,
      responseCode: params.pp_ResponseCode,
      bankID: params.pp_BankID,
      amount: params.pp_Amount,
      raw: { ...params },
    })
    console.log(`[jazzcash/return] order ${orderNumber}: hash=${result.hashStatus} → ${paymentStatus}`)
  } catch (err) {
    console.error("[jazzcash/return] verification error:", err)
  }

  const updated = updateOrderPayment(order.id, {
    paymentStatus,
    paymentProvider: "jazzcash",
    transactionId: params.pp_TxnRefNo ?? undefined,
    paymentDetails: details?.substring(0, 4000),
  })

  // Fire notifications after marking payment status.
  if (updated) {
    const forNotify = {
      order_number: updated.order_number,
      full_name: updated.full_name,
      phone: updated.phone,
      email: updated.email,
      city: updated.city,
      address: updated.address,
      payment_method: updated.payment_method,
      payment_status: updated.payment_status,
      total: updated.total,
      items: updated.items.map((i) => ({
        productName: i.product_name,
        variantTitle: i.variant_title,
        quantity: i.quantity,
        price: i.price,
      })),
    }
    await sendPaymentAlert(forNotify)
  }

  return NextResponse.redirect(
    new URL(
      `/checkout/success?order=${encodeURIComponent(orderNumber)}&payment=${paymentStatus}`,
      req.url
    )
  )
}